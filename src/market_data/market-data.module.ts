import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestMarketDataUseCase } from './application/use-cases/ingest-market-data.use-case';
import { BinanceWsAdapter } from './infrastructure/adapters/exchanges/binance-ws.adapter';
// import { CoinbaseWsAdapter } from './infrastructure/adapters/exchanges/coinbase-ws.adapter';
import { RedisStreamAdapter } from './infrastructure/adapters/redis/redis-stream.adapter';
import { StreamPublisherPort } from './domain/ports/out/stream-publisher.port';
import { MarketHistoryRepositoryPort } from './domain/ports/out/market-history-repository.port';
import { TypeOrmMarketHistoryRepository } from './infrastructure/adapters/persistence/typeorm-market-history.repository';
import { PriceTickEntity } from './infrastructure/adapters/persistence/entity/typeorm-tick.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PriceTickEntity])],
  providers: [
    IngestMarketDataUseCase,
    // Proveedor para Redis
    {
      provide: StreamPublisherPort,
      useClass: RedisStreamAdapter,
    },
    {
      provide: 'EXCHANGE_CONNECTORS',
      useFactory: () => {
        return [new BinanceWsAdapter()];
      },
    },
    {
      provide: MarketHistoryRepositoryPort,
      useClass: TypeOrmMarketHistoryRepository,
    },
  ],
  exports: [IngestMarketDataUseCase],
})
export class MarketDataModule {}
