import { DataSource } from 'typeorm';
import '@timescaledb/typeorm';
import dotenv from 'dotenv';

dotenv.config();
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'tsdb',
  synchronize: false,
  migrations: ['src/infrastructure/database/migrations/*{.ts,.js}'],
  logging: true,
});
