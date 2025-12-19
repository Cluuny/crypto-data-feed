import { Module } from '@nestjs/common';
import { MarketDataModule } from './market_data/market-data.module';

@Module({
  imports: [MarketDataModule],
})
export class AppModule {}
