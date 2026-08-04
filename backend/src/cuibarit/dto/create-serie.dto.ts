import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsUUID } from 'class-validator';

export class CreateSerieDto {
  @IsUUID()
  perecheId: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dataImperechere?: Date;
}
