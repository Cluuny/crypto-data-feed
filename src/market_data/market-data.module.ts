import { Module } from '@nestjs/common';
import { IngestMarketDataUseCase } from './application/use-cases/ingest-market-data.use-case';
import { BinanceWsAdapter } from './infrastructure/adapters/exchanges/binance-ws.adapter';
// import { CoinbaseWsAdapter } from './infrastructure/adapters/exchanges/coinbase-ws.adapter';
import { RedisStreamAdapter } from './infrastructure/adapters/redis/redis-stream.adapter';
import { StreamPublisherPort } from './domain/ports/out/stream-publisher.port';

@Module({
  providers: [
    IngestMarketDataUseCase,
    // Proveedor para Redis
    {
      provide: StreamPublisherPort,
      useClass: RedisStreamAdapter,
    },
    // Proveedor múltiple para los Exchanges
    {
      provide: 'EXCHANGE_CONNECTORS',
      useFactory: () => {
        return [new BinanceWsAdapter()];
      },
    },
  ],
  exports: [IngestMarketDataUseCase], // Si se necesita fuera
})
export class MarketDataModule {}
