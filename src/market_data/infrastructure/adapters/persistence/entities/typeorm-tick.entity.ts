import { Entity, Column, PrimaryColumn, Index } from 'typeorm';
import { Hypertable, TimeColumn } from '@timescaledb/typeorm';

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
  @Column()
  symbol: string;

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

  @Column()
  source: string;
}
