import { Observable } from 'rxjs';
import { PriceTick } from '../../entities/price-tick.entity';

export interface ExchangeConnectorPort {
  name: string;
  connect(symbols: string[]): void;
  getPriceStream(): Observable<PriceTick>;
  getHealthCheckStream(): Observable<string>;
}
