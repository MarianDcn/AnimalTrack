import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/types/jwt-payload.type';
import { CreatePerecheDto } from './dto/create-pereche.dto';
import { UpdatePerecheDto } from './dto/update-pereche.dto';
import { PerecheService } from './pereche.service';

@UseGuards(JwtAuthGuard)
@Controller('perechi')
export class PerecheController {
  constructor(private readonly perecheService: PerecheService) {}

  @Post()
  create(@CurrentUser() user: CurrentUserData, @Body() dto: CreatePerecheDto) {
    return this.perecheService.create(user.fermaId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.perecheService.findAll(user.fermaId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.perecheService.findOne(user.fermaId, id);
  }

  @Get(':id/serii')
  findSerii(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.perecheService.findSerii(user.fermaId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: UpdatePerecheDto,
  ) {
    return this.perecheService.update(user.fermaId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.perecheService.remove(user.fermaId, id);
  }
}
