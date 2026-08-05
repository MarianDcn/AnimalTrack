import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PasariModule } from './pasari/pasari.module';
import { PerecheModule } from './perechi/pereche.module';
import { CuibaritModule } from './cuibarit/cuibarit.module';
import { StatisticiModule } from './statistici/statistici.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    PasariModule,
    PerecheModule,
    CuibaritModule,
    StatisticiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
