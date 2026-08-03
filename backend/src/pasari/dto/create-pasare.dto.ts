import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { SexPasare, StatusPasare } from '../../../generated/prisma/enums';

export class CreatePasareDto {
  @IsString()
  @MinLength(1)
  nrInel: string;

  @IsString()
  @IsOptional()
  nume?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dataEclozare?: Date;

  @IsEnum(SexPasare)
  @IsOptional()
  sex?: SexPasare;

  @IsString()
  @IsOptional()
  mutatie?: string;

  @IsString()
  @IsOptional()
  culoare?: string;

  @IsUUID()
  @IsOptional()
  tataId?: string;

  @IsUUID()
  @IsOptional()
  mamaId?: string;

  @IsString()
  @IsOptional()
  observatii?: string;

  @IsEnum(StatusPasare)
  @IsOptional()
  status?: StatusPasare;
}
