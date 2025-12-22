import { Entity, PrimaryColumn } from 'typeorm';

@Entity('exchanges')
export class Exchanges {
  @PrimaryColumn()
  name: string;
}
