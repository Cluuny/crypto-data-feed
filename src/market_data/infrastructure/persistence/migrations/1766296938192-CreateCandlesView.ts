import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCandlesView1766296938192 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Vista para calcular estadísticas de huecos por símbolo y fuente
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW public.candles_gaps_view AS
      WITH symbol_stats AS (
        SELECT 
          symbol,
          source,
          MIN(time) as first_candle,
          MAX(time) as last_candle,
          COUNT(*) as actual_candles,
          (EXTRACT(EPOCH FROM (MAX(time) - MIN(time)))/60)::bigint + 1 as expected_candles
        FROM public.candles_m1
        GROUP BY symbol, source
      )
      SELECT 
        symbol,
        source,
        first_candle,
        last_candle,
        expected_candles,
        actual_candles,
        (expected_candles - actual_candles) as missing_candles
      FROM symbol_stats
      WHERE (expected_candles - actual_candles) > 0;
    `);

    // Crear un índice para mejorar el rendimiento de las búsquedas
    await queryRunner.query(
      `CREATE UNIQUE INDEX ON public.candles_gaps_view (symbol, source);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP MATERIALIZED VIEW public.candles_gaps_view;`);
  }
}
