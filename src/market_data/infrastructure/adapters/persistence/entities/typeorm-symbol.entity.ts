import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('symbols')
export class Symbols {
  @PrimaryColumn()
  symbol: string;

  @Column()
  base_currency: string;

  @Column()
  quote_currency: string;
}