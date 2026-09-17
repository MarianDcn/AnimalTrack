import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/types/jwt-payload.type';
import { UpdateFermaDto } from './dto/update-ferma.dto';
import { FermaService } from './ferma.service';

@UseGuards(JwtAuthGuard)
@Controller('ferma')
export class FermaController {
  constructor(private readonly fermaService: FermaService) {}

  @Patch()
  update(@CurrentUser() user: CurrentUserData, @Body() dto: UpdateFermaDto) {
    return this.fermaService.update(user.fermaId, dto);
  }
}
