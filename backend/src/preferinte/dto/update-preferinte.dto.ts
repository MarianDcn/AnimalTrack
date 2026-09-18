import { IsHexColor, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdatePreferinteDto {
  @IsIn(['deschis', 'intunecat', 'automat'])
  @IsOptional()
  tema?: string;

  @IsString()
  @IsHexColor()
  @IsOptional()
  culoarePrincipala?: string;

  @IsIn(['compacta', 'confortabila'])
  @IsOptional()
  densitateTabele?: string;

  @IsIn(['normal', 'mare'])
  @IsOptional()
  marimeText?: string;

  @IsIn(['/', '/pasari', '/perechi', '/statistici'])
  @IsOptional()
  paginaImplicita?: string;
}
