import { Module } from '@nestjs/common';
import { StatisticiController } from './statistici.controller';
import { StatisticiService } from './statistici.service';

@Module({
  controllers: [StatisticiController],
  providers: [StatisticiService],
})
export class StatisticiModule {}
