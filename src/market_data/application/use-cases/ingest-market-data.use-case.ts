import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { ExchangeConnectorPort } from '../../domain/ports/in/exchange-connector.port';
import { StreamPublisherPort } from '../../domain/ports/out/stream-publisher.port';
import { MarketHistoryRepositoryPort } from '../../domain/ports/out/market-history-repository.port';
import { SymbolsRepositoryPort } from '../../domain/ports/out/symbols-repository.port';
import { ExchangesRepositoryPort } from '../../domain/ports/out/exchange-repository.port';
import { ExchangesEntity } from '../../infrastructure/adapters/persistence/entities/typeorm-exchanges.entity';
import { SymbolEntity } from '../../infrastructure/adapters/persistence/entities/typeorm-symbol.entity';
import { PriceTick } from '../../domain/entities/price-tick.entity';

@Injectable()
export class IngestMarketDataUseCase implements OnModuleInit {
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
    const symbolsToSubscribe = ['BTC-USDT'];

    this.exchanges.forEach((exchange) => {
      void this.ensureExchangeExists(exchange.name);

      exchange.connect(symbolsToSubscribe);
      exchange.getPriceStream().subscribe({
        next: (tick: PriceTick) => {
          if (tick.volume > 0) {
            void (async () => {
              try {
                await this.ensureSymbolExists(tick.symbol);

                await this.historyRepo.save(tick);

                void this.publisher.publish(tick);
              } catch (error) {
                console.error(`Error procesando tick ${tick.symbol}:`, error);
              }
            })();
          }
        },
        error: (err) => console.error(`Error en stream ${exchange.name}`, err),
      });
    });
  }

  private async ensureExchangeExists(name: string) {
    if (this.knownExchanges.has(name)) return;

    const exists = await this.exchangesRepo.getExchange(name);
    if (!exists) {
      console.log(`Registrando nuevo exchange: ${name}`);
      this.exchangesRepo.saveExchange(new ExchangesEntity(name));
    }
    this.knownExchanges.add(name);
  }

  private async ensureSymbolExists(symbolStr: string) {
    if (this.knownSymbols.has(symbolStr)) return;

    const exists = await this.symbolsRepo.getSymbol(symbolStr);
    if (!exists) {
      console.log(`Registrando nuevo símbolo: ${symbolStr}`);
      const [base, quote] = symbolStr.includes('-')
        ? symbolStr.split('-')
        : [symbolStr, 'USD'];

      this.symbolsRepo.saveSymbols(new SymbolEntity(symbolStr, base, quote));
    }
    this.knownSymbols.add(symbolStr);
  }
}
