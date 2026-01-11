// src/market-data/infrastructure/adapters/exchanges/rest/binance-rest-client.adapter.ts
import { Injectable, Logger } from '@nestjs/common';
import { RestClientConnectorPort } from '../../../../domain/ports/in/rest-client.connector.port';
import { MainClient, KlinesParams } from 'binance';
import { PriceTick } from 'src/market_data/domain/entities/price-tick.entity';

@Injectable()
export class BinanceRestClientAdapter implements RestClientConnectorPort {
  private readonly logger = new Logger(BinanceRestClientAdapter.name);
  name: string;
  client: MainClient;

  constructor() {
    this.name = 'BINANCE';

    const useTestnet = false;

    this.logger.log(`Conectando a Binance Mainnet (Modo Público)`);

    this.client = new MainClient({
      testnet: useTestnet,
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
    try {
      const result = await this.client.getKlines(klineParams);

      if (result.length > 0) {
        const firstCandleDate = new Date(result[0][0]);
        const lastCandleDate = new Date(result[result.length - 1][0]);
        this.logger.log(
          `[${symbol}] Rango Recibido: [${firstCandleDate.toISOString()}] - [${lastCandleDate.toISOString()}] - Total Descargado: ${result.length}`,
        );
      } else {
        this.logger.warn(`Binance devolvió 0 velas para ${symbol}`);
      }

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
    } catch (error) {
      this.logger.error(`Error crítico: ${JSON.stringify(error)}`);
    }
    return response;
  }
}
