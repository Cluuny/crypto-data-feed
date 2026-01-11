// src/market-data/infrastructure/api/graphql/market-data.resolver.ts
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { FillGapsMarketDataUseCase } from '../../../application/use-cases/fill-gaps-market-data.use-case';
import { MarketHistoryRepositoryPort } from '../../../domain/ports/out/market-history-repository.port';
import { SymbolGapStats } from './models/symbol-gap-stats.model';

@Resolver()
export class MarketDataResolver {
  constructor(
    private readonly fillGapsUseCase: FillGapsMarketDataUseCase,
    private readonly historyRepo: MarketHistoryRepositoryPort,
  ) {}

  @Query(() => [SymbolGapStats])
  async getGapAnalysis(): Promise<SymbolGapStats[]> {
    const stats = await this.historyRepo.findAllSymbolsWithGaps();
    return stats.map((s) => ({
      symbol: s.symbol,
      source: s.source,
      firstCandle: s.firstCandle,
      lastCandle: s.lastCandle,
      expectedCandles: s.expectedCandles,
      actualCandles: s.actualCandles,
      missingCandles: s.missingCandles,
    }));
  }

  @Mutation(() => Boolean)
  async triggerBackfill(
    @Args('symbols', { type: () => [String] }) symbols: string[],
  ): Promise<boolean> {
    // Ejecutamos en segundo plano para no bloquear la respuesta
    void this.fillGapsUseCase.runInitialBackfill(symbols);
    return true;
  }

  @Mutation(() => Boolean)
  async triggerGapFilling(): Promise<boolean> {
    // Ejecutamos en segundo plano
    void this.fillGapsUseCase.detectAndFillAllGaps();
    return true;
  }
}
