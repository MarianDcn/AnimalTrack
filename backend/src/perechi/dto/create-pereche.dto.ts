import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { StatusPereche } from '../../generated/prisma/enums';

export class CreatePerecheDto {
  @IsUUID()
  masculId: string;

  @IsUUID()
  femelaId: string;

  @IsEnum(StatusPereche)
  @IsOptional()
  status?: StatusPereche;
}
