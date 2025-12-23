import { PriceTick } from '../../entities/price-tick.entity';
import { PriceTickEntity } from '../../../infrastructure/adapters/persistence/entities/typeorm-tick.entity';

export abstract class MarketHistoryRepositoryPort {
  abstract save(tick: PriceTick): Promise<void>;
  abstract saveMany(ticks: PriceTick[]): Promise<void>;
  abstract getAllTicks(): Promise<PriceTickEntity[]>;
  abstract getCount(): Promise<number>;
  abstract findLast(): Promise<PriceTickEntity[]>;
  abstract findGaps(
    symbol: string,
    source: string,
    lookback: string,
  ): Promise<{ start: Date; end: Date }[]>;
  abstract findLastTick(
    symbol: string,
    source: string,
  ): Promise<PriceTick | null>;
}
