import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { PrismaService } from '../prisma/prisma.service';
import { PasariService, type NodStramos, type NodDescendent } from './pasari.service';
import {
  BOX_W,
  PAS_GENERATIE,
  PAS_SLOT,
  aseazaArbore,
  coordonate,
  inaltimeCasuta,
  type Muchie,
  type NodCuCopii,
  type NodPozitionat,
} from './arbore-pdf-layout.util';

const SEX_LABEL: Record<string, string> = {
  MASCUL: 'Mascul',
  FEMELA: 'Femela',
  NECUNOSCUT: 'Necunoscut',
};

const SEX_CULOARE: Record<string, string> = {
  MASCUL: '#1565c0',
  FEMELA: '#ad1457',
  NECUNOSCUT: '#757575',
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

function stramosSpreCopii(nod: NodStramos | null): NodCuCopii | null {
  if (!nod) return null;
  const copii: NodCuCopii[] = [];
  const tata = stramosSpreCopii(nod.tata);
  const mama = stramosSpreCopii(nod.mama);
  if (tata) copii.push(tata);
  if (mama) copii.push(mama);
  return { ...nod, copii };
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
    doc.text(`Rnc: ${pasare.rnc ?? '-'}`);
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

  async genereazaArborePdf(
    fermaId: string,
    id: string,
    mod: 'stramosi' | 'descendenti',
  ): Promise<{ doc: PDFKit.PDFDocument; nrInel: string }> {
    const arbore = await this.pasariService.getArbore(fermaId, id, 5, 2);

    const radacina: NodCuCopii =
      mod === 'descendenti'
        ? { ...arbore.pasare, copii: arbore.descendenti as unknown as NodCuCopii[] }
        : {
            ...arbore.pasare,
            copii: [stramosSpreCopii(arbore.stramosi.tata), stramosSpreCopii(arbore.stramosi.mama)].filter(
              (n): n is NodCuCopii => n !== null,
            ),
          };

    const noduri: NodPozitionat[] = [];
    const muchii: Muchie[] = [];
    const latimeTotalaUnit = aseazaArbore(radacina, 0, 0, noduri, muchii);
    const adancimeMaxima = noduri.reduce((max, n) => Math.max(max, n.generatie), 0);
    const mapaNoduri = new Map(noduri.map((n) => [n.id, n]));

    const ANTET_H = 90;
    const MARGINE = 40;
    const latimeArbore = adancimeMaxima * PAS_GENERATIE + BOX_W;
    const inaltimeArbore = latimeTotalaUnit * PAS_SLOT;

    const doc = new PDFDocument({
      size: [latimeArbore + MARGINE * 2, inaltimeArbore + ANTET_H + MARGINE * 2],
      margin: MARGINE,
    });

    const titluMod = mod === 'descendenti' ? 'Descendenti' : 'Stramosi';
    doc.fontSize(18).text(`Arbore genealogic - ${arbore.pasare.nrInel}`, { underline: true });
    doc.fontSize(11).fillColor('#555').text(`${titluMod} - generat la ${formatData(new Date())}`);
    doc.fillColor('black');

    // Legenda
    const legendaY = doc.y + 10;
    let legendaX = MARGINE;
    for (const sex of ['MASCUL', 'FEMELA', 'NECUNOSCUT'] as const) {
      doc
        .save()
        .lineWidth(1.5)
        .strokeColor(SEX_CULOARE[sex])
        .circle(legendaX + 5, legendaY + 5, 5)
        .stroke()
        .restore();
      doc.fontSize(9).fillColor('#555').text(SEX_LABEL[sex], legendaX + 16, legendaY);
      legendaX += 90;
    }
    doc.fillColor('black');

    const originY = legendaY + 25;

    for (const m of muchii) {
      const parinte = mapaNoduri.get(m.parinteId)!;
      const copil = mapaNoduri.get(m.copilId)!;
      const pParinte = coordonate(parinte.generatie, parinte.pozitieUnit);
      const pCopil = coordonate(copil.generatie, copil.pozitieUnit);
      const x1 = MARGINE + pParinte.x + BOX_W;
      const y1 = originY + pParinte.y;
      const x2 = MARGINE + pCopil.x;
      const y2 = originY + pCopil.y;
      const mid = (x1 + x2) / 2;
      doc
        .save()
        .lineWidth(1.25)
        .strokeColor('#999999')
        .moveTo(x1, y1)
        .bezierCurveTo(mid, y1, mid, y2, x2, y2)
        .stroke()
        .restore();
    }

    for (const n of noduri) {
      const { x, y } = coordonate(n.generatie, n.pozitieUnit);
      const h = inaltimeCasuta(n.mutatii.length);
      const boxX = MARGINE + x;
      const boxY = originY + y - h / 2;

      doc
        .save()
        .lineWidth(1.5)
        .strokeColor(SEX_CULOARE[n.sex] ?? SEX_CULOARE.NECUNOSCUT)
        .roundedRect(boxX, boxY, BOX_W, h, 4)
        .stroke()
        .restore();

      doc
        .fontSize(9.5)
        .fillColor('black')
        .text(`${n.nrInel}${n.rnc ? ` - ${n.rnc}` : ''}`, boxX + 6, boxY + 5, {
          width: BOX_W - 12,
          ellipsis: true,
        });

      const liniiAfisate = n.mutatii.slice(0, 3);
      liniiAfisate.forEach((mut, i) => {
        doc
          .fontSize(8)
          .fillColor('#555')
          .text(mut, boxX + 6, boxY + 5 + 14 + i * 12, { width: BOX_W - 12, ellipsis: true });
      });
      if (n.mutatii.length > 3) {
        doc
          .fontSize(8)
          .fillColor('#555')
          .text(`+${n.mutatii.length - 3} alte mutatii`, boxX + 6, boxY + 5 + 14 + 3 * 12, {
            width: BOX_W - 12,
          });
      }
      doc.fillColor('black');
    }

    return { doc, nrInel: arbore.pasare.nrInel };
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
      { header: 'Rnc', key: 'rnc', width: 18 },
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
