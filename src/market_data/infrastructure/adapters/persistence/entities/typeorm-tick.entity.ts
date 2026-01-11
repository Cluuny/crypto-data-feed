// src/market-data/infrastructure/adapters/persistence/entities/typeorm-tick.entity.ts
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
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
export class CandleM1Entity {
  @PrimaryColumn({ type: 'text' })
  symbol: string;

  @PrimaryColumn({ type: 'text' })
  source: string;

  @TimeColumn()
  @PrimaryColumn({ type: 'timestamptz' })
  time: Date;

  @ManyToOne(() => SymbolEntity, {
    nullable: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'symbol', referencedColumnName: 'symbol' })
  symbolRel?: SymbolEntity;

  @ManyToOne(() => ExchangesEntity, {
    nullable: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'source', referencedColumnName: 'name' })
  exchangeRel?: ExchangesEntity;

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
}
