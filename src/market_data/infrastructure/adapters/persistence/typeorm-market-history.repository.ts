import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketHistoryRepositoryPort } from '../../../domain/ports/out/market-history-repository.port';
import { PriceTick } from '../../../domain/entities/price-tick.entity'; // Entidad Dominio
import { PriceTickEntity } from './entity/typeorm-tick.entity'; // Entidad TypeORM

@Injectable()
export class TypeOrmMarketHistoryRepository implements MarketHistoryRepositoryPort {
  constructor(
    @InjectRepository(PriceTickEntity)
    private readonly ormRepo: Repository<PriceTickEntity>,
  ) {}

  async save(tick: PriceTick): Promise<void> {
    const dbEntity = new PriceTickEntity();
    dbEntity.symbol = tick.symbol;
    dbEntity.time = tick.time;
    dbEntity.open = tick.open;
    dbEntity.high = tick.high;
    dbEntity.low = tick.low;
    dbEntity.close = tick.close;
    dbEntity.volume = tick.volume;
    dbEntity.source = tick.source;
    await this.ormRepo.save(dbEntity);
  }

  async getAllTicks(): Promise<PriceTick[]> {
    return await this.ormRepo.find();
  }

  async getCount(): Promise<number> {
    return await this.ormRepo.count();
  }
}
