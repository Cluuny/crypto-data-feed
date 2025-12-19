import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('price-ticks')
export class PriceTickEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  symbol: string;

  @Column()
  price: number;

  @Column()
  volume: number;

  @Column()
  source: string;

  @Column()
  timestamp: string;
}
