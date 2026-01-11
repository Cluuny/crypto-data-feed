// src/market-data/application/use-cases/fill-gaps-market-data.use-case.ts
import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MarketHistoryRepositoryPort } from '../../domain/ports/out/market-history-repository.port';
import { RestClientConnectorPort } from '../../domain/ports/in/rest-client.connector.port';
import { SymbolsRepositoryPort } from '../../domain/ports/out/symbols-repository.port';
import { ExchangesRepositoryPort } from '../../domain/ports/out/exchange-repository.port';
import { Symbol as DomainSymbol } from '../../domain/model/symbol';
import { Exchange } from '../../domain/model/exchange';
import { GapRangeDto } from '../dtos/gap-range.dto';
import jsonData from '../../../config/config.json';

interface SymbolGapStat {
  symbol: string;
  source: string;
  missingCandles: number;
  lastCandle: Date;
}

@Injectable()
export class FillGapsMarketDataUseCase {
  private readonly logger = new Logger(FillGapsMarketDataUseCase.name);
  private readonly BATCH_SIZE = 1000;
  private readonly MAX_CONCURRENT_FILLS = 3;
  private readonly GENESIS_DATE = new Date(jsonData.genesis_date);
  private isFillingGaps = false;
  private isBackfilling = false;

  constructor(
    @Inject('EXCHANGE_REST_CLIENTS')
    private readonly restClientList: RestClientConnectorPort[],
    private readonly historyRepo: MarketHistoryRepositoryPort,
    private readonly symbolRepo: SymbolsRepositoryPort,
    private readonly exchangeRepo: ExchangesRepositoryPort,
  ) {}

  async runInitialBackfill(symbols: string[]) {
    if (this.isBackfilling) {
      this.logger.warn('El backfill inicial ya está en ejecución.');
      return;
    }
    this.isBackfilling = true;
    this.logger.log('Ejecutando Backfill Inicial...');

    try {
      await this.processBackfill(symbols);
      this.logger.log('Backfill inicial completado.');
    } catch (error) {
      this.logger.error(`Error en backfill inicial: ${error}`);
    } finally {
      this.isBackfilling = false;
    }
  }

  private async processBackfill(symbols: string[]) {
    for (const client of this.restClientList) {
      for (const symbol of symbols) {
        await this.syncExchangeSession(client, symbol);
      }
    }
  }

  private async syncExchangeSession(
    client: RestClientConnectorPort,
    symbol: string,
  ) {
    const correctedSymbol = symbol.replace('-', '');
    this.logger.log(`Procesando símbolo en backfill: ${correctedSymbol}`);
    try {
      // Asegura que tanto símbolo como Exchange existan en BD
      await this.ensureSymbolAndExchangeExist(correctedSymbol, client.name);

      // 1. Verificar si hay datos previos
      const firstTick = await this.historyRepo.findFirstTickForSource(
        correctedSymbol,
        client.name,
      );

      // Caso 1: No hay datos en absoluto. Backfill completo GENESIS -> NOW
      if (!firstTick) {
        this.logger.log(
          `[${client.name}] ${correctedSymbol}: No hay datos previos. Iniciando descarga completa desde ${this.GENESIS_DATE.toISOString()}`,
        );
        await this.downloadRange(
          client,
          correctedSymbol,
          this.GENESIS_DATE,
          new Date(),
        );
        return;
      }

      // Caso 2: Hay datos, pero empiezan mucho después del GENESIS (Hueco Inicial)
      // Si el primer dato es posterior a GENESIS_DATE, llenamos ese hueco específico.
      if (firstTick.time > this.GENESIS_DATE) {
        this.logger.log(
          `[${client.name}] ${correctedSymbol}: Datos inician en ${firstTick.time.toISOString()}. Rellenando hueco inicial desde ${this.GENESIS_DATE.toISOString()}`,
        );
        // Descargamos solo hasta el primer tick conocido para no solapar
        await this.downloadRange(
          client,
          correctedSymbol,
          this.GENESIS_DATE,
          firstTick.time,
        );
      }

      // 2. Si hay datos, buscamos huecos internos
      const gapRanges: GapRangeDto[] = await this.historyRepo.findGapRanges(
        correctedSymbol,
        client.name,
      );

      if (gapRanges.length > 0) {
        this.logger.log(
          `[${client.name}] ${correctedSymbol}: Encontrados ${gapRanges.length} huecos internos.`,
        );
        for (const gap of gapRanges) {
          this.logger.log(
            `[${client.name}] ${correctedSymbol}: Rellenando hueco ${gap.gapStart.toISOString()} - ${gap.gapEnd.toISOString()}`,
          );
          await this.downloadRange(
            client,
            correctedSymbol,
            gap.gapStart,
            gap.gapEnd,
          );
        }
      }

      // 3. Llenar desde el último tick conocido hasta ahora (Real-time catchup)
      // Obtenemos el último tick actualizado después de las operaciones anteriores
      const lastTick = await this.historyRepo.findLastTickForSource(
        correctedSymbol,
        client.name,
      );

      if (lastTick) {
        const now = new Date();
        // Margen de 2 minutos para evitar solapamientos con datos en tiempo real
        const catchupStart = new Date(lastTick.time.getTime() + 60000);

        if (catchupStart < now) {
          this.logger.log(
            `[${client.name}] ${correctedSymbol}: Actualizando datos recientes desde ${catchupStart.toISOString()}`,
          );
          await this.downloadRange(client, correctedSymbol, catchupStart, now);
        }
      }

      this.logger.log(
        `[${client.name}] ${correctedSymbol}: Sincronización completada.`,
      );
    } catch (error) {
      this.logger.error(
        `[${client.name}] ${correctedSymbol}: Error en sincronización: ${error}`,
      );
    }
  }

  private async downloadRange(
    client: RestClientConnectorPort,
    symbol: string,
    start: Date,
    end: Date,
  ) {
    let currentStart = new Date(start);
    let totalDownloaded = 0;

    while (currentStart < end) {
      try {
        // Calcular el final de este lote (batch)
        // Si pedimos BATCH_SIZE velas de 1 minuto, cubrimos BATCH_SIZE minutos
        const batchEndTime = new Date(
          currentStart.getTime() + this.BATCH_SIZE * 60000,
        );
        // No pedir más allá del 'end' global
        const queryEnd = batchEndTime > end ? end : batchEndTime;

        const candles = await client.getKlines(
          symbol,
          currentStart,
          queryEnd,
          this.BATCH_SIZE,
        );

        if (candles.length > 0) {
          await this.historyRepo.saveMany(candles);
          totalDownloaded += candles.length;

          // Avanzamos currentStart basado en la última vela recibida + 1 minuto
          const lastCandleTime = candles[candles.length - 1].time;
          const nextStart = new Date(lastCandleTime.getTime() + 60000);

          // Protección contra bucles: si la API devuelve velas antiguas o repetidas
          if (nextStart <= currentStart) {
            this.logger.warn(
              `[${client.name}] ${symbol}: La API no avanzó el tiempo. Forzando avance.`,
            );
            currentStart = new Date(
              currentStart.getTime() + this.BATCH_SIZE * 60000,
            );
          } else {
            currentStart = nextStart;
          }
        } else {
          // Si no hay velas en este rango, asumimos que es un hueco vacío en el exchange
          // y avanzamos el puntero para intentar el siguiente bloque
          this.logger.debug(
            `[${client.name}] ${symbol}: Sin datos en ${currentStart.toISOString()}. Avanzando ventana.`,
          );
          currentStart = new Date(
            currentStart.getTime() + this.BATCH_SIZE * 60000,
          );
        }

        await this.sleep(200); // Rate limiting corto
      } catch (error) {
        this.logger.error(
          `[${client.name}] ${symbol}: Error descargando lote: ${error}`,
        );
        await this.sleep(5000); // Espera más larga en caso de error
        // En caso de error, intentamos avanzar un poco para no quedarnos pegados en el mismo timestamp corrupto
        currentStart = new Date(currentStart.getTime() + 60000);
      }
    }

    if (totalDownloaded > 0) {
      this.logger.log(
        `[${client.name}] ${symbol}: Descarga finalizada. Total: ${totalDownloaded} velas.`,
      );
    }
  }

  private async ensureSymbolAndExchangeExist(
    symbol: string,
    exchangeName: string,
  ) {
    const exchange = await this.exchangeRepo.findByName(exchangeName);
    if (!exchange) {
      await this.exchangeRepo.save(new Exchange(exchangeName));
    }
    const symbolExists = await this.symbolRepo.findBySymbol(symbol);
    if (!symbolExists) {
      const quote_currency = 'USDT';
      const base_currency = symbol.replace(quote_currency, '');
      await this.symbolRepo.save(
        new DomainSymbol(symbol, base_currency, quote_currency),
      );
    }
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async scheduledGapFilling() {
    if (this.isFillingGaps) {
      this.logger.warn('Gap filling programado ya está en ejecución.');
      return;
    }
    this.isFillingGaps = true;
    this.logger.log('Iniciando Job de llenado de huecos programado...');
    try {
      await this.detectAndFillAllGaps();
    } catch (error) {
      this.logger.error(`Error en gap filling programado: ${error}`);
    } finally {
      this.isFillingGaps = false;
    }
  }

  async detectAndFillAllGaps() {
    this.logger.log('Buscando símbolos con huecos...');
    const symbolsWithGaps = await this.historyRepo.findAllSymbolsWithGaps();

    if (symbolsWithGaps.length === 0) {
      this.logger.log('No se encontraron huecos en ningún símbolo.');
      return;
    }

    this.logger.log(
      `Encontrados ${symbolsWithGaps.length} símbolos con huecos.`,
    );
    const prioritized = this.prioritizeSymbols(
      symbolsWithGaps as SymbolGapStat[],
    );

    for (let i = 0; i < prioritized.length; i += this.MAX_CONCURRENT_FILLS) {
      const batch = prioritized.slice(i, i + this.MAX_CONCURRENT_FILLS);
      await Promise.all(
        batch.map((stat) => this.fillGapsForSymbol(stat.symbol, stat.source)),
      );
      if (i + this.MAX_CONCURRENT_FILLS < prioritized.length) {
        await this.sleep(1000);
      }
    }
    this.logger.log('Proceso de llenado de huecos completado.');
  }

  private prioritizeSymbols(stats: SymbolGapStat[]): SymbolGapStat[] {
    const now = new Date();
    return stats.sort((a, b) => {
      const aIsRecent = now.getTime() - a.lastCandle.getTime() < 86400000;
      const bIsRecent = now.getTime() - b.lastCandle.getTime() < 86400000;
      if (aIsRecent && !bIsRecent) return -1;
      if (!aIsRecent && bIsRecent) return 1;
      return a.missingCandles - b.missingCandles;
    });
  }

  async fillGapsForSymbol(symbol: string, source: string) {
    this.logger.log(`Procesando huecos para ${symbol} en ${source}`);
    const client = this.restClientList.find((c) => c.name === source);
    if (!client) {
      this.logger.error(`Cliente REST no encontrado para ${source}`);
      return;
    }

    try {
      const gaps = await this.historyRepo.findGapRanges(symbol, source, 1);
      if (gaps.length === 0) {
        return;
      }
      this.logger.log(
        `${symbol} (${source}): ${gaps.length} huecos encontrados.`,
      );

      for (const gap of gaps) {
        await this.downloadRange(client, symbol, gap.gapStart, gap.gapEnd);
        await this.sleep(200); // Rate limiting corto
      }
    } catch (error) {
      this.logger.error(
        `Error procesando huecos de ${symbol} (${source}): ${error}`,
      );
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
