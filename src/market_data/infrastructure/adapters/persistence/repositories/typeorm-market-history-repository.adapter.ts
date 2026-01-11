// src/market-data/infrastructure/adapters/persistence/repositories/typeorm-market-history-repository.adapter.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MarketHistoryRepositoryPort,
  SymbolGapStats,
} from '../../../../domain/ports/out/market-history-repository.port';
import { PriceTick } from '../../../../domain/entities/price-tick.entity';
import { CandleM1Entity } from '../entities/typeorm-tick.entity';
import { GapRangeDto } from '../../../../application/dtos/gap-range.dto';

type GapRow = {
  gap_start: Date;
  gap_end: Date;
  missing_count: number;
};

@Injectable()
export class TypeormMarketHistoryRepositoryAdapter implements MarketHistoryRepositoryPort {
  constructor(
    @InjectRepository(CandleM1Entity)
    private readonly ormRepo: Repository<CandleM1Entity>,
  ) {}

  async findGapRanges(symbol: string, source: string): Promise<GapRangeDto[]> {
    const query = `WITH time_diffs AS (
      SELECT
                     time as actual_time,
                     LAG(time) OVER (ORDER BY time) as prev_time,
                     symbol
                   FROM candles_m1
                   WHERE symbol = $1
                     AND source = $2
                     ),
                     gaps_calculated AS (
                   SELECT
                     actual_time,
                     prev_time,
                     ROUND(EXTRACT(EPOCH FROM (actual_time - prev_time)) / 60) as diff_minutes
                   FROM time_diffs
                   WHERE prev_time IS NOT NULL
                     )
    SELECT
      prev_time + INTERVAL '1 minute' as gap_start,
      actual_time - INTERVAL '1 minute' as gap_end,
      (diff_minutes - 1) as missing_count
    FROM gaps_calculated
    WHERE diff_minutes >= 2
    ORDER BY gap_start;`;

    const rows: GapRow[] = await this.ormRepo.query(query, [symbol, source]);

    return rows.map((gap) => new GapRangeDto(gap.gap_start, gap.gap_end));
  }

  async findAllSymbolsWithGaps(): Promise<SymbolGapStats[]> {
    const query = `SELECT symbol, source, first_candle as "firstCandle", last_candle as "lastCandle", expected_candles as "expectedCandles", actual_candles as "actualCandles", missing_candles as "missingCandles" FROM public.candles_gaps_view ORDER BY "missing_candles" DESC;`;
    return await this.ormRepo.query(query);
  }

  async save(tick: PriceTick): Promise<void> {
    await this.ormRepo
      .createQueryBuilder()
      .insert()
      .into(CandleM1Entity)
      .values(this.toEntity(tick))
      .orUpdate(
        ['open', 'high', 'low', 'close', 'volume'],
        ['symbol', 'source', 'time'],
      )
      .execute();
  }

  async saveMany(ticks: PriceTick[]): Promise<void> {
    if (ticks.length === 0) return;

    const entities = ticks.map((tick) => this.toEntity(tick));

    await this.ormRepo
      .createQueryBuilder()
      .insert()
      .into(CandleM1Entity)
      .values(entities)
      .orUpdate(
        ['open', 'high', 'low', 'close', 'volume'],
        ['symbol', 'source', 'time'],
      )
      .execute();
  }

  async findLastTickForSource(
    symbol: string,
    source: string,
  ): Promise<PriceTick | null> {
    const entity = await this.ormRepo.findOne({
      where: { symbol, source },
      order: { time: 'DESC' },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findFirstTickForSource(
    symbol: string,
    source: string,
  ): Promise<PriceTick | null> {
    const entity = await this.ormRepo.findOne({
      where: { symbol, source },
      order: { time: 'ASC' },
    });

    return entity ? this.toDomain(entity) : null;
  }

  private toEntity(tick: PriceTick): CandleM1Entity {
    const entity = new CandleM1Entity();

    entity.symbol = tick.symbol;
    entity.source = tick.source;
    entity.time = tick.time;
    entity.open = tick.open;
    entity.high = tick.high;
    entity.low = tick.low;
    entity.close = tick.close;
    entity.volume = tick.volume;

    return entity;
  }

  private toDomain(entity: CandleM1Entity): PriceTick {
    return new PriceTick(
      entity.symbol,
      entity.time,
      entity.open,
      entity.high,
      entity.low,
      entity.close,
      entity.volume,
      entity.source,
    );
  }
}
