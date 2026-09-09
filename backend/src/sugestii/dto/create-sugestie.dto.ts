import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSugestieDto {
  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  mesaj: string;
}
