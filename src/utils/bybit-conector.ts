import { WebsocketClient } from 'bybit-api';
import { BybitWsreponseDto } from '../market_data/application/dtos/bybyit-wsresponse.dto';

const ws = new WebsocketClient();

// (v5) subscribe to multiple topics at once
// ws.subscribeV5(['orderbook.50.BTCUSDT', 'orderbook.50.ETHUSDT'], 'linear');

// Or one at a time
ws.subscribeV5(['kline.1.BTCUSDT'], 'linear');

// Private/public topics can be used in the same WS client instance, even for
// different API groups (linear, options, spot, etc)
// ws.subscribeV5('position', 'linear');
// ws.subscribeV5('publicTrade.BTC', 'option');

/**
 * The Websocket Client will automatically manage all connectivity & authentication for you.
 *
 * If a network issue occurs, it will automatically:
 * - detect it,
 * - remove the dead connection,
 * - replace it with a new one,
 * - resubscribe to everything you were subscribed to.
 *
 * When this happens, you will see the "reconnected" event.
 */

// Listen to events coming from websockets. This is the primary data source
ws.on('update', (data) => {
  const convertedData = data as BybitWsreponseDto;
  if (convertedData.data[0].confirm) {
    console.log(convertedData.data[0]);
  }
  console.log('data received', JSON.stringify(data, null, 2));
});

// Optional: Listen to websocket connection open event
// (automatic after subscribing to one or more topics)
ws.on('open', ({ wsKey }) => {
  console.log('connection open for websocket with ID: ', wsKey);
});

// Optional: Listen to responses to websocket queries
// (e.g. the response after subscribing to a topic)
ws.on('response', (response) => {
  console.log('response', response);
});

// Optional: Listen to connection close event.
// Unexpected connection closes are automatically reconnected.
ws.on('close', () => {
  console.log('connection closed');
});

// Listen to raw error events. Recommended.
ws.on('exception', (err) => {
  console.error('exception', err);
});

ws.on('reconnect', ({ wsKey }) => {
  console.log('ws automatically reconnecting.... ', wsKey);
});

ws.on('reconnected', (data) => {
  console.log('ws has reconnected ', data?.wsKey);
});
