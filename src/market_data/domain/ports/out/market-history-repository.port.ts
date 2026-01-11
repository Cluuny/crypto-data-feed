// src/market-data/domain/ports/out/market-history-repository.port.ts
import { PriceTick } from '../../entities/price-tick.entity';
import { GapRangeDto } from '../../../application/dtos/gap-range.dto';

export interface SymbolGapStats {
  symbol: string;
  source: string;
  firstCandle: Date;
  lastCandle: Date;
  expectedCandles: number;
  actualCandles: number;
  missingCandles: number;
}

export abstract class MarketHistoryRepositoryPort {
  abstract save(tick: PriceTick): Promise<void>;
  abstract saveMany(ticks: PriceTick[]): Promise<void>;
  abstract findLastTickForSource(
    symbol: string,
    source: string,
  ): Promise<PriceTick | null>;

  abstract findFirstTickForSource(
    symbol: string,
    source: string,
  ): Promise<PriceTick | null>;

  abstract findGapRanges(
    symbol: string,
    source: string,
    minGapMinutes?: number,
  ): Promise<GapRangeDto[]>;

  abstract findAllSymbolsWithGaps(): Promise<SymbolGapStats[]>;
}
