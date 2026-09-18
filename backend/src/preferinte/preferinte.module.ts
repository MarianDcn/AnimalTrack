import { Module } from '@nestjs/common';
import { PreferinteController } from './preferinte.controller';
import { PreferinteService } from './preferinte.service';

@Module({
  controllers: [PreferinteController],
  providers: [PreferinteService],
})
export class PreferinteModule {}
