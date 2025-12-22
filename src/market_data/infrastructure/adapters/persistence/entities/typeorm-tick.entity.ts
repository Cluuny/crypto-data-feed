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
@Index(['symbol', 'time'], { unique: true }) // Índice compuesto para Timescale
export class PriceTickEntity {
  // --- LLAVE FORÁNEA 1: SYMBOL ---

  // 1. La columna física (necesaria para la Primary Key compuesta de Timescale)
  @PrimaryColumn()
  symbol: string;

  // 2. La Relación (Foreign Key)
  @ManyToOne(() => SymbolEntity)
  @JoinColumn({ name: 'symbol', referencedColumnName: 'symbol' }) // 'name' debe coincidir con la propiedad de arriba
  symbolRel: SymbolEntity;

  // --- LLAVE FORÁNEA 2: EXCHANGE (SOURCE) ---

  // 1. La columna física
  @Column()
  source: string;

  // 2. La Relación (Foreign Key)
  @ManyToOne(() => ExchangesEntity)
  @JoinColumn({ name: 'source', referencedColumnName: 'name' }) // 'name' debe coincidir con la propiedad de arriba
  exchangeRel: ExchangesEntity;
  // --- COLUMNAS DE DATOS ---

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
}
