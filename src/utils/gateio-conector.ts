import { WebsocketClient, WsTopicRequest } from 'gateio-api';
import { GateioWsreponseDto } from '../market_data/application/dtos/gateio-wsreponse.dto';
import { PriceTick } from '../market_data/domain/entities/price-tick.entity';

const ws = new WebsocketClient();
const symbols: string[] = ['BTC-USDT', 'ETH-USDT'];
const modifiedSymbols = symbols.map((symbol) => symbol.replace('-', '_'));

const payloads: (string | WsTopicRequest<string, any>)[] = [];

for (const symbol of modifiedSymbols) {
  const payload = {
    topic: 'spot.candlesticks',
    payload: ['1m', symbol],
  };
  // console.log(payload);
  payloads.push(payload);
}
// const klines1 = {
//   topic: 'spot.candlesticks',
//   payload: ['1m', 'BTC_USDT'],
// };
// const klines2 = {
//   topic: 'spot.candlesticks',
//   payload: ['1m', 'ETH_USDT'],
// };
// ws.subscribe([klines1, klines2], 'spotV4');
ws.subscribe(payloads, 'spotV4');

// Listen to events coming from websockets. This is the primary data source
ws.on('update', (data) => {
  const convertedData = data as GateioWsreponseDto;
  if (convertedData.result.w) {
    handleMessage(convertedData);
  }
});

// Optional: Listen to websocket connection open event (automatic after subscribing to one or more topics)
ws.on('open', ({ wsKey }) => {
  console.log('connection open for websocket with ID: ' + wsKey);
});

// Optional: Listen to responses to websocket queries (e.g. the reply after subscribing to a topic)
ws.on('response', (response) => {
  console.log('response', response);
});

// Optional: Listen to connection close event. Unexpected connection closes are automatically reconnected.
ws.on('close', () => {
  console.log('connection closed');
});

// Optional: listen to internal exceptions. Useful for debugging if something weird happens
ws.on('exception', (data) => {
  console.error('exception: ', data);
});

// Optional: Listen to raw error events.
ws.on('error', (err) => {
  console.error('ERR', err);
});

function handleMessage(data: GateioWsreponseDto): void {
  if (data.result.w) {
    const priceTick = new PriceTick(
      data.result.n,
      new Date(data.result.t),
      Number(data.result.o),
      Number(data.result.h),
      Number(data.result.l),
      Number(data.result.c),
      Number(data.result.v),
      'GATE.IO',
    );
    console.log(priceTick);
  }
}
