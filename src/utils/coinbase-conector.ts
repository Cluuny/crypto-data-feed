import { WebsocketClient, WsTopicRequest } from 'coinbase-api';

function start() {
  const client = new WebsocketClient();

  client.on('open', (data) => {
    console.log('open: ', data?.wsKey);
  });

  // Data received
  client.on('update', (data) => {
    console.info(new Date(), 'data received: ', data);
  });

  // Something happened, attempting to reconenct
  client.on('reconnect', (data) => {
    console.log('reconnect: ', data);
  });

  // Reconnect successful
  client.on('reconnected', (data) => {
    console.log('reconnected: ', data);
  });

  // Connection closed. If unexpected, expect reconnect -> reconnected.
  client.on('close', (data) => {
    console.error('close: ', data);
  });

  // Reply to a request, e.g. "subscribe"/"unsubscribe"/"authenticate"
  client.on('response', (data) => {
    console.info('response: ', JSON.stringify(data, null, 2));
    // throw new Error('res?');
  });

  client.on('exception', (data) => {
    console.error('exception: ', data);
  });

  try {
    const tickerSubscribeRequest: WsTopicRequest = {
      topic: 'ticker',
      payload: {
        product_ids: ['BTC-USD'],
      },
    };
    client.subscribe(tickerSubscribeRequest, 'advTradeMarketData');
  } catch (e) {
    console.error(`Subscribe exception: `, e);
  }
}

start();
