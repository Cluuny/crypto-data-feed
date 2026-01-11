// src/market-data/infrastructure/adapters/persistence/repositories/typeorm-symbol-repository.adapter
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SymbolEntity } from '../entities/typeorm-symbol.entity';
import { SymbolsRepositoryPort } from '../../../../domain/ports/out/symbols-repository.port';
import { Symbol } from '../../../../domain/model/symbol';

@Injectable()
export class TypeormSymbolRepositoryAdapter implements SymbolsRepositoryPort {
  constructor(
    @InjectRepository(SymbolEntity)
    private readonly ormRepo: Repository<SymbolEntity>,
  ) {}

  async findBySymbol(symbol: string): Promise<Symbol | null> {
    const symbolEntity = await this.ormRepo.findOneBy({ symbol });
    return symbolEntity
      ? new Symbol(
          symbolEntity.symbol,
          symbolEntity.base_currency,
          symbolEntity.quote_currency,
        )
      : null;
  }

  async save(symbol: Symbol): Promise<void> {
    const symbolEntity = this.ormRepo.create(symbol);
    await this.ormRepo.save(symbolEntity);
  }

  async getAll(): Promise<Symbol[]> {
    const symbolEntities = await this.ormRepo.find();
    return symbolEntities.map(
      (entity) =>
        new Symbol(entity.symbol, entity.base_currency, entity.quote_currency),
    );
  }
}
