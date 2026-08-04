import { PartialType } from '@nestjs/mapped-types';
import { CreatePerecheDto } from './create-pereche.dto';

export class UpdatePerecheDto extends PartialType(CreatePerecheDto) {}
