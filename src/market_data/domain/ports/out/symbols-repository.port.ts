import { SymbolEntity } from '../../../infrastructure/adapters/persistence/entities/typeorm-symbol.entity';

export abstract class SymbolsRepositoryPort {
  abstract getAll(): Promise<SymbolEntity[]>;
  abstract getSymbol(name: string): Promise<Promise<SymbolEntity> | null>;
  abstract saveSymbols(symbol: SymbolEntity): void;
}
