import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CautaQueryDto {
  @IsString()
  @MaxLength(50)
  @IsOptional()
  nrInel?: string;
}
