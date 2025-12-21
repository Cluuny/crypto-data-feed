import { PriceTick } from '../../entities/price-tick.entity';
import { PriceTickEntity } from '../../../infrastructure/adapters/persistence/entity/typeorm-tick.entity'; // Ojo: La entidad PURA, sin TypeORM

export abstract class MarketHistoryRepositoryPort {
  abstract save(tick: PriceTick): Promise<void>;
  abstract getAllTicks(): Promise<PriceTick[]>;
  abstract getCount(): Promise<number>;
  abstract findLast(): Promise<PriceTickEntity[]>;
}
