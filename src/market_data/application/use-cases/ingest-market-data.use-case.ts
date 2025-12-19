import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { ExchangeConnectorPort } from '../../domain/ports/in/exchange-connector.port';
import { StreamPublisherPort } from '../../domain/ports/out/stream-publisher.port';

@Injectable()
export class IngestMarketDataUseCase implements OnModuleInit {
  constructor(
    @Inject('EXCHANGE_CONNECTORS')
    private readonly exchanges: ExchangeConnectorPort[],
    private readonly publisher: StreamPublisherPort,
  ) {}

  onModuleInit() {
    const symbols = ['BTC-USDT', 'ETH-USDT'];

    // Suscribirse a todos los exchanges simultáneamente
    this.exchanges.forEach((exchange) => {
      exchange.connect(symbols);

      exchange.getPriceStream().subscribe({
        next: (tick) => {
          console.log(`PRECIO RECIBIDO: ${tick.symbol} - $${tick.price}`);
          if (tick.volume > 0) {
            void this.publisher.publish(tick);
          }
        },
        error: (err) => console.error(`Error en ${exchange.name}`, err),
      });
    });
  }
}
