// import { WebsocketClient } from 'coinbase-api';
// import { ExchangeConnectorPort } from '../../../domain/ports/in/exchange-connector.port';
// import { Observable, Subject } from 'rxjs';
// import { PriceTick } from '../../../domain/entities/price-tick.entity';
//
// export class CoinbaseWsAdapter implements ExchangeConnectorPort {
//   public name = 'COINBASE';
//   private stream$: Subject<PriceTick> = new Subject<PriceTick>();
//
//   public connect(symbols: string[]): Promise<void> {
//     return new Promise(void)(():void => {
//       const client = new WebsocketClient();
//
//
//     })
//   }
//   public getPriceStream(): Observable<PriceTick> {
//     throw new Error('Method not implemented.');
//   }
// }
