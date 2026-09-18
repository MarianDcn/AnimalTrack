import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/types/jwt-payload.type';
import { CreateSugestieDto } from './dto/create-sugestie.dto';
import { SugestiiService } from './sugestii.service';

@UseGuards(JwtAuthGuard)
@Controller('sugestii')
export class SugestiiController {
  constructor(private readonly sugestiiService: SugestiiService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateSugestieDto) {
    return this.sugestiiService.create(user.fermaId, user.id, dto);
  }

  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    return this.sugestiiService.findAll();
  }
}
