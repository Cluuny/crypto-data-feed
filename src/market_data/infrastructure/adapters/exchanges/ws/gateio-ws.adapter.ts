import { ExchangeConnectorPort } from '../../../../domain/ports/in/exchange-connector.port';
import { Observable, Subject } from 'rxjs';
import { PriceTick } from '../../../../domain/entities/price-tick.entity';
import { WebsocketClient, WsTopicRequest } from 'gateio-api';
import { GateioWsreponseDto } from '../../../../application/dtos/gateio-wsreponse.dto';

export class GateioWsAdapter implements ExchangeConnectorPort {
  public name = 'GATE.IO';
  private priceStream$: Subject<PriceTick> = new Subject<PriceTick>();
  private healthCheckStream$: Subject<string> = new Subject<string>();

  connect(symbols: string[]): void {
    const wsClient = new WebsocketClient();
    // symbols = ['BTC-USDT']
    // Gateio needed payload = ['BTC_USDT']
    const modifiedSymbols = symbols.map((symbol) => symbol.replace('-', '_'));
    const payloads: (string | WsTopicRequest<string, any>)[] = [];

    for (const symbol of modifiedSymbols) {
      const payload = {
        topic: 'spot.candlesticks',
        payload: ['1m', symbol],
      };
      payloads.push(payload);
    }

    wsClient.subscribe(payloads, 'spotV4');

    // Listen to events coming from websockets. This is the primary data source
    wsClient.on('update', (data) => {
      const convertedData = data as GateioWsreponseDto;
      if (convertedData.result.w) {
        this.handleMessage(convertedData);
      }
    });
  }

  public handleMessage(data: GateioWsreponseDto): void {
    if (data.result.w) {
      const [, crypto, pair] = data.result.n.split('_');
      const symbol = crypto + pair;
      const priceTick = new PriceTick(
        symbol,
        new Date(data.result.t),
        Number(data.result.o),
        Number(data.result.h),
        Number(data.result.l),
        Number(data.result.c),
        Number(data.result.v),
        this.name,
      );
      this.priceStream$.next(priceTick);
    }
  }

  public getPriceStream(): Observable<PriceTick> {
    return this.priceStream$.asObservable();
  }

  public getHealthCheckStream(): Observable<string> {
    return this.healthCheckStream$.asObservable();
  }
}
