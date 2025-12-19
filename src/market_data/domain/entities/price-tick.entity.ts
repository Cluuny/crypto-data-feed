export class PriceTick {
  constructor(
    public readonly symbol: string, // Ej: 'BTC-USDT'
    public readonly price: number,
    public readonly volume: number,
    public readonly source: string, // 'BINANCE', 'COINBASE'
    public readonly timestamp: Date,
  ) {}
}
