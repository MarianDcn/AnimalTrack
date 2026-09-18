import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/types/jwt-payload.type';
import { UpdatePreferinteDto } from './dto/update-preferinte.dto';
import { PreferinteService } from './preferinte.service';

@UseGuards(JwtAuthGuard)
@Controller('preferinte')
export class PreferinteController {
  constructor(private readonly preferinteService: PreferinteService) {}

  @Get()
  findOne(@CurrentUser() user: CurrentUserData) {
    return this.preferinteService.findOne(user.id);
  }

  @Patch()
  update(@CurrentUser() user: CurrentUserData, @Body() dto: UpdatePreferinteDto) {
    return this.preferinteService.update(user.id, dto);
  }
}
