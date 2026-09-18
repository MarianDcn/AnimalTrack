import { IsIn, IsOptional } from 'class-validator';

export class ExportArboreQueryDto {
  @IsIn(['stramosi', 'descendenti'])
  @IsOptional()
  mod?: 'stramosi' | 'descendenti' = 'stramosi';
}
