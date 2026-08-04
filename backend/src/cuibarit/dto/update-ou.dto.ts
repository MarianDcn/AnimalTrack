import { IsEnum } from 'class-validator';
import { StatusOu } from '../../generated/prisma/enums';

export class UpdateOuDto {
  @IsEnum(StatusOu)
  status: StatusOu;
}
