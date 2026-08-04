import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/types/jwt-payload.type';
import { CreatePasareDto } from './dto/create-pasare.dto';
import { UpdatePasareDto } from './dto/update-pasare.dto';
import { PasariService } from './pasari.service';

@UseGuards(JwtAuthGuard)
@Controller('pasari')
export class PasariController {
  constructor(private readonly pasariService: PasariService) {}

  @Post()
  create(@CurrentUser() user: CurrentUserData, @Body() dto: CreatePasareDto) {
    return this.pasariService.create(user.fermaId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.pasariService.findAll(user.fermaId);
  }

  @Get('cautare')
  cauta(@CurrentUser() user: CurrentUserData, @Query('nrInel') nrInel: string) {
    return this.pasariService.cautaDupaNrInel(user.fermaId, nrInel ?? '');
  }

  @Get(':id')
  findOne(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.pasariService.findOne(user.fermaId, id);
  }

  @Get(':id/rude')
  findRude(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.pasariService.findRude(user.fermaId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: UpdatePasareDto,
  ) {
    return this.pasariService.update(user.fermaId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.pasariService.remove(user.fermaId, id);
  }
}
