import { Module } from '@nestjs/common';
import { FermaController } from './ferma.controller';
import { FermaService } from './ferma.service';

@Module({
  controllers: [FermaController],
  providers: [FermaService],
})
export class FermaModule {}
