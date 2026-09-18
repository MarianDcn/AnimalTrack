import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PasariModule } from './pasari/pasari.module';
import { PerecheModule } from './perechi/pereche.module';
import { CuibaritModule } from './cuibarit/cuibarit.module';
import { StatisticiModule } from './statistici/statistici.module';
import { BackupModule } from './backup/backup.module';
import { SugestiiModule } from './sugestii/sugestii.module';
import { FermaModule } from './ferma/ferma.module';
import { PreferinteModule } from './preferinte/preferinte.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    PasariModule,
    PerecheModule,
    CuibaritModule,
    StatisticiModule,
    BackupModule,
    SugestiiModule,
    FermaModule,
    PreferinteModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
