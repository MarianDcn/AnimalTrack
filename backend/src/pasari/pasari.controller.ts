import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/types/jwt-payload.type';
import { ArboreQueryDto } from './dto/arbore-query.dto';
import { CautaQueryDto } from './dto/cauta-query.dto';
import { CreatePasareDto } from './dto/create-pasare.dto';
import { ExportArboreQueryDto } from './dto/export-arbore-query.dto';
import { UpdatePasareDto } from './dto/update-pasare.dto';
import { PasariExportService } from './export.service';
import { PasariService } from './pasari.service';

@UseGuards(JwtAuthGuard)
@Controller('pasari')
export class PasariController {
  constructor(
    private readonly pasariService: PasariService,
    private readonly exportService: PasariExportService,
  ) {}

  @Post()
  create(@CurrentUser() user: CurrentUserData, @Body() dto: CreatePasareDto) {
    return this.pasariService.create(user.fermaId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.pasariService.findAll(user.fermaId);
  }

  @Get('cautare')
  cauta(@CurrentUser() user: CurrentUserData, @Query() query: CautaQueryDto) {
    return this.pasariService.cautaDupaNrInel(user.fermaId, query.nrInel ?? '');
  }

  @Get('export-excel')
  async exportExcel(@CurrentUser() user: CurrentUserData, @Res() res: Response) {
    const buffer = await this.exportService.genereazaExcel(user.fermaId);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename="pasari.xlsx"');
    res.send(buffer);
  }

  @Get(':id')
  findOne(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.pasariService.findOne(user.fermaId, id);
  }

  @Get(':id/rude')
  findRude(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.pasariService.findRude(user.fermaId, id);
  }

  @Get(':id/arbore')
  getArbore(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Query() query: ArboreQueryDto,
  ) {
    return this.pasariService.getArbore(
      user.fermaId,
      id,
      query.generatiiSus ?? 5,
      query.generatiiJos ?? 2,
    );
  }

  @Get(':id/export-pdf')
  async exportPdf(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const { doc, nrInel } = await this.exportService.genereazaPdf(user.fermaId, id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="fisa-${nrInel}.pdf"`);
    doc.pipe(res);
    doc.end();
  }

  @Get(':id/export-arbore-pdf')
  async exportArborePdf(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Query() query: ExportArboreQueryDto,
    @Res() res: Response,
  ) {
    const { doc, nrInel } = await this.exportService.genereazaArborePdf(
      user.fermaId,
      id,
      query.mod ?? 'stramosi',
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="arbore-genealogic-${nrInel}-${query.mod ?? 'stramosi'}.pdf"`,
    );
    doc.pipe(res);
    doc.end();
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
