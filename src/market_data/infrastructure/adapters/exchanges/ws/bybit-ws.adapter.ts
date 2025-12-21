import { WebsocketClient } from 'bybit-api';
import { Observable, Subject } from 'rxjs';
import { ExchangeConnectorPort } from '../../../../domain/ports/in/exchange-connector.port';
import { PriceTick } from '../../../../domain/entities/price-tick.entity';
import { BybitWsreponseDto } from '../../../../application/dtos/bybyit-wsresponse.dto';

export class BybitWsAdapter implements ExchangeConnectorPort {
  public name = 'COINBASE';
  private priceStream$: Subject<PriceTick> = new Subject<PriceTick>();
  private healthCheckStream$: Subject<string> = new Subject<string>();

  public connect(symbols: string[]): void {
    const wsClient = new WebsocketClient();
    symbols.forEach((symbol) => {
      return 'kline.1.' + symbol.replace('-', '');
    });

    void Promise.all(wsClient.subscribeV5(symbols, 'linear'));

    wsClient.on('update', (data) => {
      const convertedData = data as BybitWsreponseDto;
      this.handleMessage(convertedData);
    });

    wsClient.on('open', ({ wsKey }) => {
      console.log('connection open for websocket with ID: ', wsKey);
    });

    wsClient.on('response', (response) => {
      console.log('response', response);
    });

    wsClient.on('close', () => {
      console.log('connection closed');
    });

    wsClient.on('exception', (err) => {
      console.error('exception', err);
    });

    wsClient.on('reconnect', ({ wsKey }) => {
      console.log('ws automatically reconnecting.... ', wsKey);
    });

    wsClient.on('reconnected', (data) => {
      console.log('ws has reconnected ', data?.wsKey);
    });
  }

  public handleMessage(data: BybitWsreponseDto): void {
    if (data.data[0].confirm) {
      const symbolName = data.topic.replace('kline.1.', '');
      const priceTick = new PriceTick(
        symbolName,
        new Date(data.data[0].timestamp),
        Number(data.data[0].open),
        Number(data.data[0].high),
        Number(data.data[0].low),
        Number(data.data[0].close),
        Number(data.data[0].volume),
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
