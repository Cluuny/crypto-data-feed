export class PriceTick {
  // 1. Declarar las propiedades explícitamente
  public readonly symbol: string;
  public readonly time: Date;
  public readonly open: number;
  public readonly high: number;
  public readonly low: number;
  public readonly close: number;
  public readonly volume: number;
  public readonly source: string;

  // 2. Constructor estándar (sin 'public' ni 'readonly' dentro de los paréntesis)
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
