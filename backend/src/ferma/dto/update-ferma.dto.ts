import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateFermaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nume: string;
}
