import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SexPasare } from '../../generated/prisma/enums';

export class EclozeazaDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  nrInel: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  rnc?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dataEclozare?: Date;

  @IsEnum(SexPasare)
  @IsOptional()
  sex?: SexPasare;

  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  @IsOptional()
  mutatii?: string[];

  @IsString()
  @MaxLength(2000)
  @IsOptional()
  observatii?: string;
}
