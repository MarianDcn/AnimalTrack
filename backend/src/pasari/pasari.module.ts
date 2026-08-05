import { Module } from '@nestjs/common';
import { PasariController } from './pasari.controller';
import { PasariService } from './pasari.service';
import { PasariExportService } from './export.service';

@Module({
  controllers: [PasariController],
  providers: [PasariService, PasariExportService],
})
export class PasariModule {}
