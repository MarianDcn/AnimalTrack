import { Module } from '@nestjs/common';
import { OuaController } from './oua.controller';
import { OuaService } from './oua.service';
import { SeriiController } from './serii.controller';
import { SeriiService } from './serii.service';

@Module({
  controllers: [SeriiController, OuaController],
  providers: [SeriiService, OuaService],
})
export class CuibaritModule {}
