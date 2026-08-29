import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { PrismaService } from '../prisma/prisma.service';
import { PasariService, type NodStramos, type NodDescendent } from './pasari.service';

const SEX_LABEL: Record<string, string> = {
  MASCUL: 'Mascul',
  FEMELA: 'Femela',
  NECUNOSCUT: 'Necunoscut',
};

function formatData(d: Date): string {
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
}

function formatMutatii(mutatii: string[]): string {
  return mutatii.length > 0 ? ` (${mutatii.join(', ')})` : '';
}

function scrieStramosi(doc: PDFKit.PDFDocument, nod: NodStramos | null, eticheta: string, adancime: number) {
  if (!nod) return;
  doc.text(`${'    '.repeat(adancime)}${eticheta}: ${nod.nrInel}${formatMutatii(nod.mutatii)}`);
  scrieStramosi(doc, nod.tata, 'Tata', adancime + 1);
  scrieStramosi(doc, nod.mama, 'Mama', adancime + 1);
}

function scrieDescendenti(doc: PDFKit.PDFDocument, noduri: NodDescendent[], adancime: number) {
  for (const n of noduri) {
    doc.text(`${'    '.repeat(adancime)}- ${n.nrInel}${formatMutatii(n.mutatii)}`);
    scrieDescendenti(doc, n.copii, adancime + 1);
  }
}

@Injectable()
export class PasariExportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pasariService: PasariService,
  ) {}

  async genereazaPdf(
    fermaId: string,
    id: string,
  ): Promise<{ doc: PDFKit.PDFDocument; nrInel: string }> {
    const pasare = await this.pasariService.findOne(fermaId, id);
    const arbore = await this.pasariService.getArbore(fermaId, id, 5, 2);

    const doc = new PDFDocument({ margin: 50 });

    doc.fontSize(20).text(`Fisa pasare - ${pasare.nrInel}`, { underline: true });
    doc.moveDown();

    doc.fontSize(12);
    doc.text(`RNC: ${pasare.rnc ?? '-'}`);
    doc.text(`Sex: ${SEX_LABEL[pasare.sex] ?? pasare.sex}`);
    doc.text(`Data eclozarii: ${pasare.dataEclozare ? formatData(pasare.dataEclozare) : '-'}`);
    doc.text(`Mutatii: ${pasare.mutatii.length > 0 ? pasare.mutatii.join(', ') : '-'}`);
    doc.text(`Status: ${pasare.status}`);
    if (pasare.observatii) {
      doc.text(`Observatii: ${pasare.observatii}`);
    }
    doc.moveDown();

    doc.fontSize(14).text('Parinti', { underline: true });
    doc.fontSize(12);
    doc.text(`Tata: ${arbore.stramosi.tata?.nrInel ?? '-'}`);
    doc.text(`Mama: ${arbore.stramosi.mama?.nrInel ?? '-'}`);
    doc.moveDown();

    doc.fontSize(14).text('Arbore genealogic (simplificat)', { underline: true });
    doc.fontSize(11);
    doc.text('Stramosi:');
    if (!arbore.stramosi.tata && !arbore.stramosi.mama) {
      doc.text('    (niciun stramos inregistrat)');
    } else {
      scrieStramosi(doc, arbore.stramosi.tata, 'Tata', 1);
      scrieStramosi(doc, arbore.stramosi.mama, 'Mama', 1);
    }
    doc.moveDown(0.5);
    doc.text('Descendenti:');
    if (arbore.descendenti.length === 0) {
      doc.text('    (niciun descendent inregistrat)');
    } else {
      scrieDescendenti(doc, arbore.descendenti, 1);
    }

    return { doc, nrInel: pasare.nrInel };
  }

  async genereazaExcel(fermaId: string): Promise<Buffer> {
    const pasari = await this.prisma.pasare.findMany({
      where: { fermaId },
      include: {
        tata: { select: { nrInel: true } },
        mama: { select: { nrInel: true } },
      },
      orderBy: { nrInel: 'asc' },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Pasari');
    sheet.columns = [
      { header: 'Nr. inel', key: 'nrInel', width: 14 },
      { header: 'RNC', key: 'rnc', width: 18 },
      { header: 'Sex', key: 'sex', width: 12 },
      { header: 'Data eclozarii', key: 'dataEclozare', width: 14 },
      { header: 'Mutatii', key: 'mutatii', width: 24 },
      { header: 'Tata (nr. inel)', key: 'tata', width: 14 },
      { header: 'Mama (nr. inel)', key: 'mama', width: 14 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Observatii', key: 'observatii', width: 32 },
      { header: 'Data creare', key: 'dataCreare', width: 14 },
    ];
    sheet.getRow(1).font = { bold: true };

    for (const p of pasari) {
      sheet.addRow({
        nrInel: p.nrInel,
        rnc: p.rnc ?? '',
        sex: SEX_LABEL[p.sex] ?? p.sex,
        dataEclozare: p.dataEclozare ? formatData(p.dataEclozare) : '',
        mutatii: p.mutatii.join(', '),
        tata: p.tata?.nrInel ?? '',
        mama: p.mama?.nrInel ?? '',
        status: p.status,
        observatii: p.observatii ?? '',
        dataCreare: formatData(p.dataCreare),
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
