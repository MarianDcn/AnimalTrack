import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SexPasare, StatusPasare } from '../../generated/prisma/enums';

export class CreatePasareDto {
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

  @IsUUID()
  @IsOptional()
  tataId?: string;

  @IsUUID()
  @IsOptional()
  mamaId?: string;

  @IsString()
  @MaxLength(2000)
  @IsOptional()
  observatii?: string;

  @IsEnum(StatusPasare)
  @IsOptional()
  status?: StatusPasare;

  @IsBoolean()
  @IsOptional()
  achizitionataDinAfara?: boolean;
}
