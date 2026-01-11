// src/market-data/infrastructure/adapters/persistence/repositories/typeorm-exchange-repository.adapter.ts
import { Injectable } from '@nestjs/common';
import { ExchangesRepositoryPort } from '../../../../domain/ports/out/exchange-repository.port';
import { ExchangesEntity } from '../entities/typeorm-exchanges.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exchange } from '../../../../domain/model/exchange';

@Injectable()
export class TypeormExchangeRepositoryAdapter implements ExchangesRepositoryPort {
  constructor(
    @InjectRepository(ExchangesEntity)
    private readonly ormRepo: Repository<ExchangesEntity>,
  ) {}

  async findByName(name: string): Promise<Exchange | null> {
    const exchangeEntity = await this.ormRepo.findOneBy({ name });
    return exchangeEntity ? new Exchange(exchangeEntity.name) : null;
  }

  async save(exchange: Exchange): Promise<void> {
    const exchangeEntity = this.ormRepo.create(exchange);
    await this.ormRepo.save(exchangeEntity);
  }

  async getAllExchanges(): Promise<Exchange[]> {
    const exchangeEntities = await this.ormRepo.find();
    return exchangeEntities.map((entity) => new Exchange(entity.name));
  }
}
