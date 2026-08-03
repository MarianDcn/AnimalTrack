import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  fermaNume: string;

  @IsString()
  @IsOptional()
  fermaAdresa?: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  parola: string;
}
