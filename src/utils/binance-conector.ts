import { WebsocketClient } from 'binance';
import { WsMessageKlineRaw } from 'binance/lib/types/websockets/ws-events-raw';
import { PriceTick } from '../market_data/domain/entities/price-tick.entity';
// import { BinanceWSResponseDTO } from '../market_data/application/dtos/binance-wsresponse.dto';
// import { PriceTick } from '../market_data/domain/entities/price-tick.entities';
// import { BinanceWSResponseDTO } from '../market_data/application/dtos/binance-wsresponse.dto';

function start() {
  const wsClient = new WebsocketClient();

  // receive raw events
  wsClient.on('message', (data) => {
    handleMessage(data as WsMessageKlineRaw);
  });

  // notification when a connection is opened
  wsClient.on('open', (data) => {
    console.log('connection opened open:', data);
  });

  // receive formatted events with beautified keys. Any "known" floats are stored in strings as parsed as floats.
  wsClient.on('formattedMessage', (data) => {
    console.log('formattedMessage: ', data);
  });

  // read response to command sent via WS stream (e.g., LIST_SUBSCRIPTIONS)
  wsClient.on('response', (data) => {
    console.log('log response: ', JSON.stringify(data, null, 2));
  });

  // receive notification when a ws connection is reconnecting automatically
  wsClient.on('reconnecting', (data) => {
    console.log('ws automatically reconnecting.... ', data);
  });

  // receive notification that a reconnection completed successfully (e.g., use REST to check for missing data)
  wsClient.on('reconnected', (data) => {
    console.log('ws has reconnected ', data);
  });

  // Recommended: receive error events (e.g., first reconnection failed)
  wsClient.on('exception', (data) => {
    console.log('ws saw error ', data);
  });
  try {
    wsClient.subscribe(
      [
        // Individual Symbol Book Ticker Streams
        // https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams#individual-symbol-book-ticker-streams
        'btcusdt@kline_1m',
      ],
      'main',
    );
  } catch (e) {
    console.error(`Subscribe exception: `, e);
  }
}

function handleMessage(data: WsMessageKlineRaw): void {
  const priceTick = new PriceTick(
    data.s,
    new Date(data.k.t),
    Number(data.k.o),
    Number(data.k.h),
    Number(data.k.l),
    Number(data.k.c),
    Number(data.k.v),
    'BINANCE',
  );
  console.log(priceTick);
}

start();
