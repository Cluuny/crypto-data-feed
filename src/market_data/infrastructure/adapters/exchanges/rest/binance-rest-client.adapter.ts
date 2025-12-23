import { RestClientConnectorPort } from '../../../../domain/ports/in/rest-client.connector.port';
import { MainClient, KlinesParams } from 'binance';
import dotenv from 'dotenv';
import { PriceTick } from 'src/market_data/domain/entities/price-tick.entity';

export class BinanceRestClientAdapter implements RestClientConnectorPort {
  name: string = 'BINANCE';
  client: MainClient;
  constructor() {
    dotenv.config();
    this.name = 'BINANCE';
    this.client = new MainClient({
      api_key: process.env.BINANCE_API_KEY,
      api_secret: process.env.BINANCE_API_SECRET,
    });
  }
  async getKlines(
    symbol: string,
    startTime: Date,
    endTime: Date,
    limit?: number,
  ): Promise<PriceTick[]> {
    const klineParams = {
      symbol: symbol,
      interval: '1m',
      startTime: startTime.getTime(),
      endTime: endTime.getTime(),
      limit: limit || 1000,
    } as KlinesParams;

    const response: PriceTick[] = [];
    const result = await this.client.getKlines(klineParams);
    result.forEach((kline) => {
      response.push(
        new PriceTick(
          symbol.toUpperCase(),
          new Date(kline[0]),
          Number(kline[1]),
          Number(kline[2]),
          Number(kline[3]),
          Number(kline[4]),
          Number(kline[5]),
          this.name,
        ),
      );
    });
    return response;
  }
}
