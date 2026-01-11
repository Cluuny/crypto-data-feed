// src/market-data/infrastructure/api/graphql/models/symbol-gap-stats.model.ts
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class SymbolGapStats {
  @Field()
  symbol: string;

  @Field()
  source: string;

  @Field(() => Date)
  firstCandle: Date;

  @Field(() => Date)
  lastCandle: Date;

  @Field(() => Int)
  expectedCandles: number;

  @Field(() => Int)
  actualCandles: number;

  @Field(() => Int)
  missingCandles: number;
}
