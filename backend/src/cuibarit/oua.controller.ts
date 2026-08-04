import { Body, Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/types/jwt-payload.type';
import { EclozeazaDto } from './dto/eclozeaza.dto';
import { UpdateOuDto } from './dto/update-ou.dto';
import { OuaService } from './oua.service';

@UseGuards(JwtAuthGuard)
@Controller('oua')
export class OuaController {
  constructor(private readonly ouaService: OuaService) {}

  @Patch(':id')
  updateStatus(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: UpdateOuDto,
  ) {
    return this.ouaService.updateStatus(user.fermaId, id, dto);
  }

  @Post(':id/eclozeaza')
  eclozeaza(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: EclozeazaDto,
  ) {
    return this.ouaService.eclozeaza(user.fermaId, id, dto);
  }
}
