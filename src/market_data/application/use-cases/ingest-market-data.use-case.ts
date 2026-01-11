// src/market-data/application/use-cases/ingest-market-data.use-case.ts
import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { ExchangeConnectorPort } from '../../domain/ports/in/exchange-connector.port';
import { StreamPublisherPort } from '../../domain/ports/out/stream-publisher.port';
import { MarketHistoryRepositoryPort } from '../../domain/ports/out/market-history-repository.port';
import { SymbolsRepositoryPort } from '../../domain/ports/out/symbols-repository.port';
import { ExchangesRepositoryPort } from '../../domain/ports/out/exchange-repository.port';
import { ExchangesEntity } from '../../infrastructure/adapters/persistence/entities/typeorm-exchanges.entity';
import { SymbolEntity } from '../../infrastructure/adapters/persistence/entities/typeorm-symbol.entity';
import { PriceTick } from '../../domain/entities/price-tick.entity';
import jsonData from './../../../config/config.json';

@Injectable()
export class IngestMarketDataUseCase implements OnModuleInit {
  private readonly logger = new Logger(IngestMarketDataUseCase.name);
  private knownSymbols = new Set<string>();
  private knownExchanges = new Set<string>();

  constructor(
    @Inject('EXCHANGE_CONNECTORS')
    private readonly exchanges: ExchangeConnectorPort[],
    private readonly publisher: StreamPublisherPort,
    private readonly historyRepo: MarketHistoryRepositoryPort,
    private readonly symbolsRepo: SymbolsRepositoryPort,
    private readonly exchangesRepo: ExchangesRepositoryPort,
  ) {}

  onModuleInit() {
    const symbolsToSubscribe = jsonData.symbols;

    this.exchanges.forEach((exchange) => {
      void this.ensureExchangeExists(exchange.name);

      exchange.connect(symbolsToSubscribe);
      exchange.getPriceStream().subscribe({
        next: (tick: PriceTick) => {
          if (tick.volume > 0) {
            void (async () => {
              try {
                // Aseguramos que el símbolo exista ANTES de intentar guardar el tick
                await this.ensureSymbolExists(tick.symbol);

                // Ahora guardamos el tick de forma segura
                await this.historyRepo.save(tick);

                this.logger.log(
                  `[${exchange.name}] - [${tick.symbol}] Tick recibido: [close] - ${tick.close}`,
                );

                // Publicar en Stream de Redis
                void this.publisher.publish(tick);
              } catch (error) {
                this.logger.error(
                  `Error procesando tick [${exchange.name}] - [${tick.symbol}]:`,
                  error,
                );
              }
            })();
          }
        },
        error: (err) => console.error(`Error en stream [${exchange.name}]`, err),
      });
    });
  }

  private async ensureExchangeExists(name: string) {
    if (this.knownExchanges.has(name)) return;

    const exists = await this.exchangesRepo.findByName(name);
    if (!exists) {
      // Esperamos a que se guarde para evitar race conditions si varios ticks llegan a la vez
      await this.exchangesRepo.save(new ExchangesEntity(name));
    }

    this.knownExchanges.add(name);
  }

  private async ensureSymbolExists(symbolStr: string) {
    if (this.knownSymbols.has(symbolStr)) return;

    const exists = await this.symbolsRepo.findBySymbol(symbolStr);
    if (!exists) {
      const [base, quote] = symbolStr.includes('-')
        ? symbolStr.split('-')
        : [symbolStr, 'USDT'];

      // Esperamos a que se guarde el símbolo antes de continuar
      await this.symbolsRepo.save(new SymbolEntity(symbolStr, base, quote));
    }

    this.knownSymbols.add(symbolStr);
  }
}
