import { Module } from '@nestjs/common';
import { PasariController } from './pasari.controller';
import { PasariService } from './pasari.service';

@Module({
  controllers: [PasariController],
  providers: [PasariService],
})
export class PasariModule {}
