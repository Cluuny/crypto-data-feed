import { PriceTick } from '../../entities/price-tick.entity';

export abstract class StreamPublisherPort {
  abstract publish(tick: PriceTick): Promise<void>;
}
