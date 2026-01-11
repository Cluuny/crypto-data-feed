// src/market-data/application/use-cases/backfill-market-data.use-case.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { FillGapsMarketDataUseCase } from './fill-gaps-market-data.use-case';
import data from '../../../config/config.json';

@Injectable()
export class BackfillMarketDataUseCase implements OnModuleInit {
  private readonly logger = new Logger(BackfillMarketDataUseCase.name);

  constructor(private readonly fillGapsUseCase: FillGapsMarketDataUseCase) {}

  onModuleInit() {
    this.logger.log('Disparando el backfill inicial de datos históricos...');

    const symbolsToBackfill: string[] = data.symbols;
    this.logger.log('Datos cargados correctamente...');
    this.logger.log(`Datos cargados: [${symbolsToBackfill.join(', ')}]`);

    void this.fillGapsUseCase.runInitialBackfill(symbolsToBackfill);
  }
}
