// src/market-data/domain/entities/price-tick.entity.ts
export class PriceTick {
  public readonly symbol: string;
  public readonly time: Date;
  public readonly open: number;
  public readonly high: number;
  public readonly low: number;
  public readonly close: number;
  public readonly volume: number;
  public readonly source: string;

  constructor(
    symbol: string,
    time: Date,
    open: number,
    high: number,
    low: number,
    close: number,
    volume: number,
    source: string,
  ) {
    // 3. Asignación manual
    this.symbol = symbol;
    this.time = time;
    this.open = open;
    this.high = high;
    this.low = low;
    this.close = close;
    this.volume = volume;
    this.source = source;
  }
}
