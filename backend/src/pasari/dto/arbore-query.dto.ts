import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class ArboreQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(6)
  @IsOptional()
  generatiiSus?: number = 3;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(4)
  @IsOptional()
  generatiiJos?: number = 2;
}
