import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketHistoryRepositoryPort } from '../../../domain/ports/out/market-history-repository.port';
import { PriceTick } from '../../../domain/entities/price-tick.entity'; // Entidad Dominio
import { PriceTickEntity } from './entities/typeorm-tick.entity'; // Entidad TypeORM

@Injectable()
export class TypeOrmMarketHistoryRepository implements MarketHistoryRepositoryPort {
  constructor(
    @InjectRepository(PriceTickEntity)
    private readonly ormRepo: Repository<PriceTickEntity>,
  ) {}

  async save(tick: PriceTick): Promise<void> {
    try {
      // ✅ insert() no hace SELECT previo, evita locks
      await this.ormRepo.insert({
        symbol: tick.symbol,
        time: tick.time,
        open: tick.open,
        high: tick.high,
        low: tick.low,
        close: tick.close,
        volume: tick.volume,
        source: tick.source,
      });
      console.log(`✅ Guardado: ${tick.symbol} - $${tick.close}`);
    } catch (error: any) {
      console.error('Error guardando:', error);
    }
  }

  async getAllTicks(): Promise<PriceTick[]> {
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
}
