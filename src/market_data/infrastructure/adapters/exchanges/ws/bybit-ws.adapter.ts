import { WebsocketClient } from 'coinbase-api';
import { Observable, Subject } from 'rxjs';
import { ExchangeConnectorPort } from '../../../../domain/ports/in/exchange-connector.port';
import { PriceTick } from '../../../../domain/entities/price-tick.entity';

export class BybitWsAdapter implements ExchangeConnectorPort {
  public name = 'COINBASE';
  private priceStream$: Subject<PriceTick> = new Subject<PriceTick>();
  private healthCheckStream$: Subject<string> = new Subject<string>();

  public connect(symbols: string[]): void {
    const wsClient = new WebsocketClient();


  }
}
