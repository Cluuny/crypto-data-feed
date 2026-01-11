// src/market-data/market-data.module.ts
import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

// Use Cases
import { IngestMarketDataUseCase } from './application/use-cases/ingest-market-data.use-case';
import { BackfillMarketDataUseCase } from './application/use-cases/backfill-market-data.use-case';
import { FillGapsMarketDataUseCase } from './application/use-cases/fill-gaps-market-data.use-case';

// Adapters
import { BinanceWsAdapter } from './infrastructure/adapters/exchanges/ws/binance-ws.adapter';
import { BinanceRestClientAdapter } from './infrastructure/adapters/exchanges/rest/binance-rest-client.adapter';
import { RedisStreamAdapter } from './infrastructure/adapters/redis/redis-stream.adapter';
import { TypeormMarketHistoryRepositoryAdapter } from './infrastructure/adapters/persistence/repositories/typeorm-market-history-repository.adapter';
import { TypeormSymbolRepositoryAdapter } from './infrastructure/adapters/persistence/repositories/typeorm-symbol-repository.adapter';
import { TypeormExchangeRepositoryAdapter } from './infrastructure/adapters/persistence/repositories/typeorm-exchange-repository.adapter';

// Entities
import { CandleM1Entity } from './infrastructure/adapters/persistence/entities/typeorm-tick.entity';
import { SymbolEntity } from './infrastructure/adapters/persistence/entities/typeorm-symbol.entity';
import { ExchangesEntity } from './infrastructure/adapters/persistence/entities/typeorm-exchanges.entity';

// Ports
import { StreamPublisherPort } from './domain/ports/out/stream-publisher.port';
import { MarketHistoryRepositoryPort } from './domain/ports/out/market-history-repository.port';
import { SymbolsRepositoryPort } from './domain/ports/out/symbols-repository.port';
import { ExchangesRepositoryPort } from './domain/ports/out/exchange-repository.port';

// GraphQL
import { MarketDataResolver } from './infrastructure/api/graphql/market-data.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([CandleM1Entity, SymbolEntity, ExchangesEntity]),
    ScheduleModule.forRoot(),
  ],
  providers: [
    // ============================================
    // USE CASES
    // ============================================
    IngestMarketDataUseCase,
    FillGapsMarketDataUseCase,
    BackfillMarketDataUseCase,

    // ============================================
    // API (GraphQL)
    // ============================================
    MarketDataResolver,

    // ============================================
    // ADAPTERS
    // ============================================
    BinanceWsAdapter,
    BinanceRestClientAdapter,
    {
      provide: StreamPublisherPort,
      useClass: RedisStreamAdapter,
    },
    {
      provide: MarketHistoryRepositoryPort,
      useClass: TypeormMarketHistoryRepositoryAdapter,
    },
    {
      provide: SymbolsRepositoryPort,
      useClass: TypeormSymbolRepositoryAdapter,
    },
    {
      provide: ExchangesRepositoryPort,
      useClass: TypeormExchangeRepositoryAdapter,
    },

    // ============================================
    // FACTORIES
    // ============================================
    {
      provide: 'EXCHANGE_CONNECTORS',
      useFactory: (binanceWs: BinanceWsAdapter) => [binanceWs],
      inject: [BinanceWsAdapter],
    },
    {
      provide: 'EXCHANGE_REST_CLIENTS',
      useFactory: (binanceRest: BinanceRestClientAdapter) => [binanceRest],
      inject: [BinanceRestClientAdapter],
    },
  ],
  exports: [
    IngestMarketDataUseCase,
    BackfillMarketDataUseCase,
    FillGapsMarketDataUseCase,
  ],
})
export class MarketDataModule implements OnModuleInit {
  private readonly logger = new Logger(MarketDataModule.name);
  onModuleInit() {
    this.logger.log('MarketDataModule inicializado.');
  }
}
