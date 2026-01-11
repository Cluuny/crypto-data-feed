// src/market-data/domain/model/symbol.ts
export class Symbol {
  constructor(
    public readonly symbol: string,
    public readonly base_currency: string,
    public readonly quote_currency: string,
  ) {}
}
