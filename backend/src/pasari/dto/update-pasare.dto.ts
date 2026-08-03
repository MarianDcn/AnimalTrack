import { PartialType } from '@nestjs/mapped-types';
import { CreatePasareDto } from './create-pasare.dto';

export class UpdatePasareDto extends PartialType(CreatePasareDto) {}
