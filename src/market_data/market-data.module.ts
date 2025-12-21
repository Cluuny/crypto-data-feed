import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestMarketDataUseCase } from './application/use-cases/ingest-market-data.use-case';
import { BackfillMarketDataUseCase } from './application/use-cases/backfill-market-data.use-case';
import { BinanceWsAdapter } from './infrastructure/adapters/exchanges/ws/binance-ws.adapter';
// import { BybitWsAdapter } from './infrastructure/adapters/exchanges/coinbase-ws.adapter';
import { RedisStreamAdapter } from './infrastructure/adapters/redis/redis-stream.adapter';
import { StreamPublisherPort } from './domain/ports/out/stream-publisher.port';
import { MarketHistoryRepositoryPort } from './domain/ports/out/market-history-repository.port';
import { TypeOrmMarketHistoryRepository } from './infrastructure/adapters/persistence/typeorm-market-history.repository';
import { PriceTickEntity } from './infrastructure/adapters/persistence/entity/typeorm-tick.entity';
import { BinanceRestClientAdapter } from './infrastructure/adapters/exchanges/BinanceRestClientAdapter';
import dotenv from 'dotenv';

dotenv.config();
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
    BackfillMarketDataUseCase,
    // Proveedor para Binance
    {
      provide: 'EXCHANGE_REST_CLIENTS',
      useFactory: () => {
        return [new BinanceRestClientAdapter()];
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
