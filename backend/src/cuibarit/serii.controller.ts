import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/types/jwt-payload.type';
import { CreateOuDto } from './dto/create-ou.dto';
import { CreateSerieDto } from './dto/create-serie.dto';
import { UpdateSerieDto } from './dto/update-serie.dto';
import { OuaService } from './oua.service';
import { SeriiService } from './serii.service';

@UseGuards(JwtAuthGuard)
@Controller('serii')
export class SeriiController {
  constructor(
    private readonly seriiService: SeriiService,
    private readonly ouaService: OuaService,
  ) {}

  @Post()
  create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateSerieDto) {
    return this.seriiService.create(user.fermaId, dto);
  }

  @Get(':id')
  findOne(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.seriiService.findOne(user.fermaId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: UpdateSerieDto,
  ) {
    return this.seriiService.update(user.fermaId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.seriiService.remove(user.fermaId, id);
  }

  @Post(':id/oua')
  adaugaOu(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: CreateOuDto,
  ) {
    return this.ouaService.create(user.fermaId, id, dto);
  }
}
