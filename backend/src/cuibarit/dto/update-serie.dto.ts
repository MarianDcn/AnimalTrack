import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class UpdateSerieDto {
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dataImperechere?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dataPrimOu?: Date;
}
