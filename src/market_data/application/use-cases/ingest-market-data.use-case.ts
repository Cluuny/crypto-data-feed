import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { ExchangeConnectorPort } from '../../domain/ports/in/exchange-connector.port';
import { StreamPublisherPort } from '../../domain/ports/out/stream-publisher.port';
import { MarketHistoryRepositoryPort } from '../../domain/ports/out/market-history-repository.port';

@Injectable()
export class IngestMarketDataUseCase implements OnModuleInit {
  constructor(
    @Inject('EXCHANGE_CONNECTORS')
    private readonly exchanges: ExchangeConnectorPort[],
    private readonly publisher: StreamPublisherPort,
    private readonly historyRepo: MarketHistoryRepositoryPort,
  ) {}

  onModuleInit() {
    const symbols = ['BTC-USDT'];

    // Suscribirse a todos los exchanges simultáneamente
    this.exchanges.forEach((exchange) => {
      exchange.connect(symbols);

      exchange.getPriceStream().subscribe({
        next: (tick) => {
          console.log(`PRECIO RECIBIDO: ${tick.symbol} - $${tick.close}`);
          void this.historyRepo.getCount().then((count) => console.log(count));
          if (tick.volume > 0) {
            void this.publisher.publish(tick);
          }
        },
        error: (err) => console.error(`Error en ${exchange.name}`, err),
      });
    });
  }
}
