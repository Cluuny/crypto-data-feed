import { PriceTick } from '../../entities/price-tick.entity';

export interface RestClientConnectorPort {
  name: string;
  getKlines(
    symbol: string,
    startTime: Date,
    endTime: Date,
    limit?: number,
  ): Promise<PriceTick[]>;
}
