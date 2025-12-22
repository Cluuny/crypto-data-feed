import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SymbolEntity } from '../entities/typeorm-symbol.entity';
import { SymbolsRepositoryPort } from '../../../../domain/ports/out/symbols-repository.port';

@Injectable()
export class TypeormSymbolRepositoryAdapter implements SymbolsRepositoryPort {
  constructor(
    @InjectRepository(SymbolEntity)
    private readonly ormRepo: Repository<SymbolEntity>,
  ) {}
  async getAll(): Promise<SymbolEntity[]> {
    return await this.ormRepo.find();
  }
  async getSymbol(name: string): Promise<Promise<SymbolEntity> | null> {
    return await this.ormRepo.findOneBy({
      symbol: name,
    });
  }
  saveSymbols(symbol: SymbolEntity): void {
    this.ormRepo.save(symbol).catch((err) => {
      console.log(err);
    });
  }
}
