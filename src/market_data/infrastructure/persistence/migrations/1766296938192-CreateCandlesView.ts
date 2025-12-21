import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCandlesView1766296938192 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE MATERIALIZED VIEW candles_m1_avg
            WITH (timescaledb.continuous) AS
            SELECT
                time_bucket('1 minute', time) AS time,
                symbol,
                AVG(open) AS open,
                AVG(high) AS high,
                AVG(low) AS low,
                AVG(close) AS close,
                AVG(volume) AS volume,
                COUNT(source) AS sources_count
            FROM candles_m1
            GROUP BY time_bucket('1 minute', time), symbol;
        `);

    await queryRunner.query(`
            SELECT add_continuous_aggregate_policy('candles_m1_avg',
                start_offset => INTERVAL '3 minutes',
                end_offset => INTERVAL '1 second',
                schedule_interval => INTERVAL '1 minute');
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP MATERIALIZED VIEW candles_m1_avg;`);
  }
}
