import {
  Entity,
  Column,
  PrimaryColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Hypertable, TimeColumn } from '@timescaledb/typeorm';
import { SymbolEntity } from './typeorm-symbol.entity';
import { ExchangesEntity } from './typeorm-exchanges.entity';

@Entity('candles_m1')
@Hypertable({
  compression: {
    compress: true,
    compress_orderby: 'time DESC',
    compress_segmentby: 'symbol',
  },
})
@Index(['symbol', 'time'], { unique: true })
export class PriceTickEntity {
  @PrimaryColumn()
  symbol: string;

  @ManyToOne(() => SymbolEntity)
  @JoinColumn({ name: 'symbol', referencedColumnName: 'symbol' })
  symbolRel: SymbolEntity;

  @Column()
  source: string;
  @ManyToOne(() => ExchangesEntity)
  @JoinColumn({ name: 'source', referencedColumnName: 'name' })
  exchangeRel: ExchangesEntity;

  @TimeColumn()
  @PrimaryColumn()
  time: Date;

  @Column('double precision')
  open: number;

  @Column('double precision')
  high: number;

  @Column('double precision')
  low: number;

  @Column('double precision')
  close: number;

  @Column('double precision')
  volume: number;

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
