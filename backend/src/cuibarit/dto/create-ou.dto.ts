import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class CreateOuDto {
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dataDepunere?: Date;
}
