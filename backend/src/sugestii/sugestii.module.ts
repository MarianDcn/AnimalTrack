import { Module } from '@nestjs/common';
import { SugestiiController } from './sugestii.controller';
import { SugestiiService } from './sugestii.service';

@Module({
  controllers: [SugestiiController],
  providers: [SugestiiService],
})
export class SugestiiModule {}
