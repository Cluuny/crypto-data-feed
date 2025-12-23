import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { MarketHistoryRepositoryPort } from '../../domain/ports/out/market-history-repository.port';
import { RestClientConnectorPort } from '../../domain/ports/in/rest-client.connector.port';

@Injectable()
export class BackfillMarketDataUseCase implements OnModuleInit {
  private readonly logger = new Logger(BackfillMarketDataUseCase.name);
  private readonly BATCH_SIZE = 1000;

  constructor(
    @Inject('EXCHANGE_REST_CLIENTS')
    private readonly restClientList: RestClientConnectorPort[],
    private readonly historyRepo: MarketHistoryRepositoryPort,
    private readonly GENESIS_DATE = new Date('2023-01-01T00:00:00Z'),
  ) {}

  onModuleInit() {
    const symbolsToBackfill = ['BTC-USDT', 'ETH-USDT'];

    void this.runOrchestrator(symbolsToBackfill);
  }

  private async runOrchestrator(symbols: string[]) {
    const now = new Date();

    for (const symbol of symbols) {
      for (const client of this.restClientList) {
        await this.syncExchangeSymbolPair(client, symbol, now);
      }
    }
    this.logger.log('Ciclo de sincronización completado.');
  }

  private async syncExchangeSymbolPair(
    client: RestClientConnectorPort,
    symbol: string,
    targetEndDate: Date,
  ) {
    const lastTick = await this.historyRepo.findLastTick(symbol, client.name);

    let startTime: Date;

    if (lastTick) {
      startTime = new Date(lastTick.time.getTime() + 60000);
      this.logger.log(
        `[${client.name}] ${symbol} encontrado hasta ${lastTick.time.toISOString()}. Reanudando...`,
      );
    } else {
      startTime = this.GENESIS_DATE;
      this.logger.log(
        `[${client.name}] ${symbol} no tiene historial. Iniciando desde cero.`,
      );
    }

    if (startTime >= targetEndDate) {
      this.logger.debug(`[${client.name}] ${symbol} ya está actualizado.`);
      return;
    }

    await this.downloadRange(client, symbol, startTime, targetEndDate);
  }

  private async downloadRange(
    client: RestClientConnectorPort,
    symbol: string,
    start: Date,
    end: Date,
  ) {
    let currentStart = new Date(start);

    // Bucle: Mientras no lleguemos al presente
    while (currentStart < end) {
      try {
        // 1. Pedir datos a la API
        this.logger.debug(
          `[${client.name}] Pidiendo ${this.BATCH_SIZE} velas desde ${currentStart.toISOString()}`,
        );

        const candles = await client.getKlines(
          symbol,
          currentStart,
          end,
          this.BATCH_SIZE,
        );

        if (candles.length === 0) break;

        await this.historyRepo.saveMany(candles);

        const lastCandle = candles[candles.length - 1];
        const nextStart = new Date(lastCandle.time.getTime() + 60000);

        if (nextStart.getTime() <= currentStart.getTime()) {
          currentStart = new Date(currentStart.getTime() + 1000 * 60000);
        } else {
          currentStart = nextStart;
        }

        await this.sleep(200);
      } catch (error) {
        this.logger.error(`[${client.name}] Error en ${symbol}: ${error}`);
        await this.sleep(5000);
        // todo: Implementar buena toma de errores
      }
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
