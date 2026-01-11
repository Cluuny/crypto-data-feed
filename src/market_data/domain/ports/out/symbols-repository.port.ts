// src/market-data/domain/ports/out/symbols-repository.port.ts
import { Symbol } from '../../model/symbol';

export abstract class SymbolsRepositoryPort {
  abstract findBySymbol(symbol: string): Promise<Symbol | null>;
  abstract save(symbol: Symbol): Promise<void>;
}
