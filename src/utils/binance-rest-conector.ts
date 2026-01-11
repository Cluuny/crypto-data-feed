import dotenv from 'dotenv';
import { KlinesParams, MainClient } from 'binance';
import { PriceTick } from '../market_data/domain/entities/price-tick.entity';

async function connect() {
  dotenv.config();

  const restClient: MainClient = new MainClient({
    api_key: 'utgOTnW05hYrakGsMl5szLsBseIeOSRdyUCuBGbdeDo8fFhSYZQqWvX0XlrWG3gm',
    api_secret:
      'Jw0Q5JSq8ZqKoP6OGfAWFhhBNOxc0oYxzX8Mi3lw1hK2M95FpXpj9lvcrQkq4XWx',
    testnet: true,
  });

  // restClient
  //   .getAccountTradeList({ symbol: 'BTCUSDT' })
  //   .then((result) => {
  //     console.log('getAccountTradeList result: ', result);
  //   })
  //   .catch((err) => {
  //     console.error('getAccountTradeList error: ', err);
  //   });
  //
  // restClient
  //   .getExchangeInfo()
  //   .then((result) => {
  //     console.log('getExchangeInfo inverse result: ', result);
  //   })
  //   .catch((err) => {
  //     console.error('getExchangeInfo inverse error: ', err);
  //   });
  console.log(`Fecha ${Date.now()}`);

  const klineParams = {
    symbol: 'BTCUSDT',
    interval: '1m',
    startTime: Date.now() - 1000 * 60 * 60 * 24 * 30,
    endTime: Date.now(),
    limit: 1000,
  } as KlinesParams;

  await restClient.getKlines(klineParams).then((result) => {
    // [
    //   1499040000000, // Open time
    //   '0.01634790', // Open
    //   '0.80000000', // High
    //   '0.01575800', // Low
    //   '0.01577100', // Close
    //   '148976.11427815', // Volume
    //   1499644799999, // Close time
    //   '2434.19055334', // Quote asset volume
    //   308, // Number of trades
    //   '1756.87402397', // Taker buy base asset volume
    //   '28.46694368', // Taker buy quote asset volume
    //   '17928899.62484339', // Ignore.
    // ];
    result.forEach((kline) => {
      const priceTick = new PriceTick(
        'BTCUSDT',
        new Date(kline[0]),
        Number(kline[1]),
        Number(kline[2]),
        Number(kline[3]),
        Number(kline[4]),
        Number(kline[5]),
        'BINANCE_REST',
      );
      console.log(priceTick);
    });
  });
}

connect().then(() => {
  console.log(`done`);
});
