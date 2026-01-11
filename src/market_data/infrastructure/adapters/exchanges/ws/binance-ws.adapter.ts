// src/market-data/infrastructure/adapters/exchanges/ws/binance-ws-adapter.ts
import { Injectable } from '@nestjs/common';
import { WebsocketClient, WsRawMessage } from 'binance';
import { ExchangeConnectorPort } from '../../../../domain/ports/in/exchange-connector.port';
import { PriceTick } from '../../../../domain/entities/price-tick.entity';
import { Observable, Subject } from 'rxjs';
import { WsMessageKlineRaw } from 'binance/lib/types/websockets/ws-events-raw';

@Injectable()
export class BinanceWsAdapter implements ExchangeConnectorPort {
  public name = 'BINANCE';
  private priceStream$: Subject<PriceTick> = new Subject<PriceTick>();
  private healthCheckStream$: Subject<string> = new Subject<string>();

  public connect(symbols: string[]): void {
    const wsClient = new WebsocketClient();

    const streamSymbols = symbols.map(
      (symbol) => symbol.toLowerCase().replace('-', '') + '@kline_1m',
    );

    wsClient.on('message', (data: WsRawMessage) => {
      this.handleMessage(data as WsMessageKlineRaw);
    });

    wsClient.on('open', () => {
      this.healthCheckStream$.next(
        `[${this.constructor.name}] - connection opened`,
      );
    });

    wsClient.on('response', (data) => {
      this.healthCheckStream$.next(
        `[${this.constructor.name}] - log response: ${JSON.stringify(data, null, 2)}`,
      );
    });

    wsClient.on('reconnecting', () => {
      this.healthCheckStream$.next(
        `[${this.constructor.name}] - ws automatically reconnecting....`,
      );
    });

    wsClient.on('reconnected', () => {
      this.healthCheckStream$.next(
        `[${this.constructor.name}] - ws has reconnected`,
      );
    });

    wsClient.on('exception', (data) => {
      this.healthCheckStream$.next(
        `[ERROR] [${this.constructor.name}] - ws saw error - ${data}`,
      );
    });

    wsClient.subscribe(streamSymbols, 'main').catch((err) => {
      this.healthCheckStream$.next(
        `[ERROR] [${this.constructor.name}] - subscribe failed - ${err}`,
      );
    });
  }

  public handleMessage(data: WsMessageKlineRaw): void {
    if (data.k.x) {
      const priceTick = new PriceTick(
        data.s,
        new Date(data.k.t),
        Number(data.k.o),
        Number(data.k.h),
        Number(data.k.l),
        Number(data.k.c),
        Number(data.k.v),
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
