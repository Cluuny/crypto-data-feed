import { Injectable } from '@nestjs/common';
import { ExchangesRepositoryPort } from '../../../../domain/ports/out/exchange-repository.port';
import { ExchangesEntity } from '../entities/typeorm-exchanges.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TypeormExchangeRepositoryAdapter implements ExchangesRepositoryPort {
  constructor(
    @InjectRepository(ExchangesEntity)
    private readonly ormRepo: Repository<ExchangesEntity>,
  ) {}
  async getExchange(name: string): Promise<Promise<ExchangesEntity> | null> {
    return await this.ormRepo.findOneBy({
      name: name,
    });
  }
  async getAllExchanges(): Promise<ExchangesEntity[]> {
    return await this.ormRepo.find();
  }
  saveExchange(newExchange: ExchangesEntity): void {
    this.ormRepo.save(newExchange).catch((err) => {
      console.log(err);
    });
  }
}
