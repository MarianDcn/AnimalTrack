import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { SexPasare } from '../../generated/prisma/enums';

export class EclozeazaDto {
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

  @IsString()
  @IsOptional()
  observatii?: string;
}
