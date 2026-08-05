import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/types/jwt-payload.type';
import { AnQueryDto } from './dto/an-query.dto';
import { StatisticiService } from './statistici.service';

@UseGuards(JwtAuthGuard)
@Controller('statistici')
export class StatisticiController {
  constructor(private readonly statisticiService: StatisticiService) {}

  @Get('pasari-pe-mutatie')
  pasariPeMutatie(@CurrentUser() user: CurrentUserData) {
    return this.statisticiService.pasariPeMutatie(user.fermaId);
  }

  @Get('pui-pe-an')
  puiPeAn(@CurrentUser() user: CurrentUserData) {
    return this.statisticiService.puiPeAn(user.fermaId);
  }

  @Get('productie-perechi')
  productiePerechi(@CurrentUser() user: CurrentUserData, @Query() query: AnQueryDto) {
    return this.statisticiService.productiePerPereche(user.fermaId, query.an);
  }

  @Get('productie-masculi')
  productieMasculi(@CurrentUser() user: CurrentUserData, @Query() query: AnQueryDto) {
    return this.statisticiService.productiePerMascul(user.fermaId, query.an);
  }

  @Get('productie-femele')
  productieFemele(@CurrentUser() user: CurrentUserData, @Query() query: AnQueryDto) {
    return this.statisticiService.productiePerFemela(user.fermaId, query.an);
  }
}
