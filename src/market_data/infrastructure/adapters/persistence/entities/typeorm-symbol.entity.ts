import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('symbols')
export class SymbolEntity {
  @PrimaryColumn()
  symbol: string;

  @Column()
  base_currency: string;

  @Column()
  quote_currency: string;

  constructor(symbol: string, base_currency: string, quote_currency: string) {
    this.symbol = symbol;
    this.base_currency = base_currency;
    this.quote_currency = quote_currency;
  }
}
