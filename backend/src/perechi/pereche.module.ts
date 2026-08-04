import { Module } from '@nestjs/common';
import { PerecheController } from './pereche.controller';
import { PerecheService } from './pereche.service';

@Module({
  controllers: [PerecheController],
  providers: [PerecheService],
})
export class PerecheModule {}
