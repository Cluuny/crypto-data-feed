import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestMarketDataUseCase } from './application/use-cases/ingest-market-data.use-case';
import { BackfillMarketDataUseCase } from './application/use-cases/backfill-market-data.use-case';
import { BinanceWsAdapter } from './infrastructure/adapters/exchanges/ws/binance-ws.adapter';
import { RedisStreamAdapter } from './infrastructure/adapters/redis/redis-stream.adapter';
import { StreamPublisherPort } from './domain/ports/out/stream-publisher.port';
import { MarketHistoryRepositoryPort } from './domain/ports/out/market-history-repository.port';
import { TypeormMarketHistoryRepositoryAdapter } from './infrastructure/adapters/persistence/repositories/typeorm-market-history-repository.adapter';
import { BinanceRestClientAdapter } from './infrastructure/adapters/exchanges/rest/binance-rest-client.adapter';
import { SymbolsRepositoryPort } from './domain/ports/out/symbols-repository.port';
import { TypeormSymbolRepositoryAdapter } from './infrastructure/adapters/persistence/repositories/typeorm-symbol-repository.adapter';
import { ExchangesRepositoryPort } from './domain/ports/out/exchange-repository.port';
import { TypeormExchangeRepositoryAdapter } from './infrastructure/adapters/persistence/repositories/typeorm-exchange-repository.adapter';
import dotenv from 'dotenv';
import { PriceTickEntity } from './infrastructure/adapters/persistence/entities/typeorm-tick.entity';
import { SymbolEntity } from './infrastructure/adapters/persistence/entities/typeorm-symbol.entity';
import { ExchangesEntity } from './infrastructure/adapters/persistence/entities/typeorm-exchanges.entity';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forFeature([PriceTickEntity, SymbolEntity, ExchangesEntity]),
  ],
  providers: [
    IngestMarketDataUseCase,
    BackfillMarketDataUseCase,
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
      provide: 'EXCHANGE_REST_CLIENTS',
      useFactory: () => {
        return [new BinanceRestClientAdapter()];
      },
    },
    // Repositorio de Historial
    {
      provide: MarketHistoryRepositoryPort,
      useClass: TypeormMarketHistoryRepositoryAdapter,
    },
    // Repositorio de Símbolos
    {
      provide: SymbolsRepositoryPort,
      useClass: TypeormSymbolRepositoryAdapter,
    },
    // Repositorio de Exchanges
    {
      provide: ExchangesRepositoryPort,
      useClass: TypeormExchangeRepositoryAdapter,
    },
  ],
  exports: [IngestMarketDataUseCase],
})
export class MarketDataModule {}
