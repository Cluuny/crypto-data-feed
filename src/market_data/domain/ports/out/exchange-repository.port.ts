// src/market-data/domain/ports/out/exchange-repository.port.ts
import { Exchange } from '../../model/exchange';

export abstract class ExchangesRepositoryPort {
  abstract findByName(name: string): Promise<Exchange | null>;
  abstract save(exchange: Exchange): Promise<void>;
}
