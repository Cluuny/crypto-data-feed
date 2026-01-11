// src/market-data/application/dtos/gap-range.dto.ts
export class GapRangeDto {
  constructor(
    public readonly gapStart: Date,
    public readonly gapEnd: Date,
  ) {}
}
