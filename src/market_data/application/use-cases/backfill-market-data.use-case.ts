import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { MarketHistoryRepositoryPort } from '../../domain/ports/out/market-history-repository.port';
import { RestClientConnectorPort } from '../../domain/ports/in/rest-client.connector.port';

@Injectable()
export class BackfillMarketDataUseCase implements OnModuleInit {
  private readonly logger = new Logger(BackfillMarketDataUseCase.name);
  private readonly BATCH_SIZE = 1000;
  private readonly GENESIS_DATE = new Date('2023-01-01T00:00:00Z'); // Fecha por defecto

  constructor(
    @Inject('EXCHANGE_REST_CLIENTS')
    private readonly restClientList: RestClientConnectorPort[],
    private readonly historyRepo: MarketHistoryRepositoryPort,
  ) {}

  onModuleInit() {
    const symbols = ['BTC-USDT'];
    const now = new Date();

    // Ejecutamos en background
    void this.processBackfill(symbols, now);
  }

  private async processBackfill(symbols: string[], targetEndDate: Date) {
    for (const symbol of symbols) {
      const correctedSymbol = symbol.replace('-', '');
      for (const client of this.restClientList) {
        await this.syncExchangeSession(client, correctedSymbol, targetEndDate);
      }
    }
    this.logger.log('Sincronización completa de todos los pares.');
  }

  private async syncExchangeSession(
    client: RestClientConnectorPort,
    symbol: string,
    targetEndDate: Date,
  ) {
    const lastTick = await this.historyRepo.findLastTickForSource(
      symbol,
      client.name,
    );

    let startTime: Date;

    if (lastTick) {
      startTime = new Date(lastTick.time.getTime() + 60000); // +1 min
      this.logger.log(
        `[${client.name}] ${symbol} reanudando desde ${startTime.toISOString()}`,
      );
    } else {
      startTime = this.GENESIS_DATE;
      this.logger.log(
        `[${client.name}] ${symbol} nuevo ingreso. Iniciando desde cero.`,
      );
    }

    if (startTime >= targetEndDate) return;

    await this.downloadRange(client, symbol, startTime, targetEndDate);
  }

  private async downloadRange(
    client: RestClientConnectorPort,
    symbol: string,
    start: Date,
    end: Date,
  ) {
    let currentStart = new Date(start);

    while (currentStart < end) {
      try {
        this.logger.debug(
          `[${client.name}] ${symbol} -> Pidiendo datos desde ${currentStart.toISOString()}`,
        );

        const candles = await client.getKlines(
          symbol,
          currentStart,
          end,
          this.BATCH_SIZE,
        );

        if (candles.length === 0) {
          this.logger.warn(`[${client.name}] ${symbol} -> Sin más datos.`);
          break;
        }

        await this.historyRepo.saveMany(candles);

        // Actualizar puntero
        const lastCandle = candles[candles.length - 1];
        const nextStart = new Date(lastCandle.time.getTime() + 60000);

        // Protección anti-bucle infinito
        if (nextStart.getTime() <= currentStart.getTime()) {
          currentStart = new Date(currentStart.getTime() + 1000 * 60000);
        } else {
          currentStart = nextStart;
        }

        await this.sleep(200); // Rate limit
      } catch (error) {
        this.logger.error(`[${client.name}] Error en ${symbol}: ${error}`);
        await this.sleep(5000);
      }
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
