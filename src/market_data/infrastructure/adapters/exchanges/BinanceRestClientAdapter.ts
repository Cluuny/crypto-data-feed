import { RestClientConnectorPort } from '../../../domain/ports/in/rest-client.connector.port';
import { AllCoinsInformationResponse, MainClient } from 'binance';
import dotenv from 'dotenv';

export class BinanceRestClientAdapter implements RestClientConnectorPort {
  name: string = 'BINANCE_REST';
  client: MainClient;
  constructor() {
    dotenv.config();
    this.name = 'BINANCE_REST';
    this.client = new MainClient({
      api_key: process.env.BINANCE_API_KEY,
      api_secret: process.env.BINANCE_API_SECRET,
    });
  }

  getKlines(symbols: string[], startTime: Date, endTime: Date): void {
    // Implement Binance REST API call here
    symbols.forEach((symbol: string) => {
      // const allCoinsInfo: AllCoinsInformationResponse[] | undefined =
      //   void this.client.getBalances();
      // console.log(allCoinsInfo);
      console.log(
        `Descargando datos de Binance para ${symbol} [${startTime.toISOString()} - ${endTime.toISOString()}]`,
      );
    });
  }
}
