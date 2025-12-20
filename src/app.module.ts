import { Module } from '@nestjs/common';
import { MarketDataModule } from './market_data/market-data.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './market_data/infrastructure/adapters/persistence/pg-timescaledb.datasource';

@Module({
  imports: [
    MarketDataModule,
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
      autoLoadEntities: true,
    }),
  ],
})
export class AppModule {}
