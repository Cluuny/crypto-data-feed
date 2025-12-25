import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketHistoryRepositoryPort } from '../../../../domain/ports/out/market-history-repository.port';
import { PriceTick } from '../../../../domain/entities/price-tick.entity'; // Entidad Dominio
import { PriceTickEntity } from '../entities/typeorm-tick.entity'; // Entidad TypeORM

@Injectable()
export class TypeormMarketHistoryRepositoryAdapter implements MarketHistoryRepositoryPort {
  constructor(
    @InjectRepository(PriceTickEntity)
    private readonly ormRepo: Repository<PriceTickEntity>,
  ) {}

  async save(tick: PriceTick): Promise<void> {
    try {
      await this.ormRepo
        .createQueryBuilder()
        .insert()
        .into(PriceTickEntity)
        .values(this.toEntity(tick))
        .orUpdate(
          ['open', 'high', 'low', 'close', 'volume'],
          ['symbol', 'time', 'source'],
        )
        .execute();
      console.log(`Guardado: ${tick.symbol} - $${tick.close}`);
    } catch (error: any) {
      console.error('Error guardando:', error);
    }
  }

  async getAllTicks(): Promise<PriceTickEntity[]> {
    return await this.ormRepo.find();
  }

  async getCount(): Promise<number> {
    return await this.ormRepo.count();
  }

  async findLast(): Promise<PriceTickEntity[]> {
    return await this.ormRepo.find({
      order: {
        time: 'DESC',
      },
      take: 1,
    });
  }

  async findGaps(
    symbol: string,
    source: string,
    lookback: string = '30 days',
  ): Promise<{ start: Date; end: Date }[]> {
    const query = `
    WITH gaps AS (
      SELECT
        time AS gap_start,
        LEAD(time) OVER (ORDER BY time) AS next_candle
      FROM candles_m1
      WHERE symbol = $1 
      AND source = $2  
      AND time > NOW() - $3::INTERVAL
    )
    SELECT
      gap_start + INTERVAL '1 minute' AS "start",
      next_candle - INTERVAL '1 minute' AS "end"
    FROM gaps
    WHERE next_candle - gap_start > INTERVAL '1 minute';
  `;

    const results: { start: Date; end: Date }[] = await this.ormRepo.query(
      query,
      [symbol, source, lookback],
    );

    return results.map((row) => ({
      start: row.start,
      end: row.end,
    }));
  }

  async saveMany(ticks: PriceTick[]): Promise<void> {
    if (ticks.length === 0) return;
    const entities = ticks.map((tick) => this.toEntity(tick));

    await this.ormRepo
      .createQueryBuilder()
      .insert()
      .into(PriceTickEntity)
      .values(entities)
      .orIgnore()
      .execute();
  }

  async findLastTick(
    symbol: string,
    source: string,
  ): Promise<PriceTick | null> {
    const entity = await this.ormRepo.findOne({
      where: { symbol, source },
      order: { time: 'DESC' },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findLastTickForSource(
    symbol: string,
    source: string,
  ): Promise<PriceTick | null> {
    const entity = await this.ormRepo.findOne({
      where: {
        symbol: symbol,
        source: source,
      },
      order: {
        time: 'DESC',
      },
    });

    if (!entity) {
      return null;
    }

    return this.toDomain(entity);
  }

  toEntity(tick: PriceTick): PriceTickEntity {
    return new PriceTickEntity(
      tick.symbol,
      tick.time,
      tick.open,
      tick.high,
      tick.low,
      tick.close,
      tick.volume,
      tick.source,
    );
  }

  toDomain(entity: PriceTickEntity): PriceTick {
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
