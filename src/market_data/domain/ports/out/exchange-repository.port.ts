import { ExchangesEntity } from '../../../infrastructure/adapters/persistence/entities/typeorm-exchanges.entity';

export abstract class ExchangesRepositoryPort {
  abstract getExchange(name: string): Promise<Promise<ExchangesEntity> | null>;
  abstract getAllExchanges(): Promise<ExchangesEntity[]>;
  abstract saveExchange(newExchange: ExchangesEntity): void;
}
