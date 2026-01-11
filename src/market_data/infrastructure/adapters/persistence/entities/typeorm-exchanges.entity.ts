// src/market-data/infrastructure/adapters/persistence/entities/typeorm-exchange.entity.ts
import { Entity, PrimaryColumn } from 'typeorm';

@Entity('exchanges')
export class ExchangesEntity {
  @PrimaryColumn()
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}
