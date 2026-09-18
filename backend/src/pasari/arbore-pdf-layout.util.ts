export interface NodArboreSimplu {
  id: string;
  nrInel: string;
  rnc: string | null;
  sex: string;
  mutatii: string[];
}

export interface NodCuCopii extends NodArboreSimplu {
  copii: NodCuCopii[];
}

export interface NodPozitionat extends NodArboreSimplu {
  generatie: number;
  pozitieUnit: number;
}

export interface Muchie {
  parinteId: string;
  copilId: string;
}

export const BOX_W = 160;
export const BOX_H_BAZA = 34;
export const LINIE_MUTATIE_H = 15;
export const MAX_LINII_MUTATII = 3;
export const BOX_H_MAX = BOX_H_BAZA + MAX_LINII_MUTATII * LINIE_MUTATIE_H;

const GEN_GAP = 70;
const SLOT_GAP = 24;
export const PAS_GENERATIE = BOX_W + GEN_GAP;
export const PAS_SLOT = BOX_H_MAX + SLOT_GAP;

export function inaltimeCasuta(nrMutatii: number): number {
  return BOX_H_BAZA + Math.min(nrMutatii, MAX_LINII_MUTATII) * LINIE_MUTATIE_H;
}

export function coordonate(generatie: number, pozitieUnit: number) {
  return { x: generatie * PAS_GENERATIE, y: pozitieUnit * PAS_SLOT };
}

export function aseazaArbore(
  nod: NodCuCopii,
  generatie: number,
  start: number,
  noduri: NodPozitionat[],
  muchii: Muchie[],
): number {
  if (nod.copii.length === 0) {
    noduri.push({ ...nod, generatie, pozitieUnit: start + 0.5 });
    return 1;
  }

  let cursor = start;
  const centre: number[] = [];
  for (const copil of nod.copii) {
    const latime = aseazaArbore(copil, generatie + 1, cursor, noduri, muchii);
    centre.push(cursor + latime / 2);
    cursor += latime;
    muchii.push({ parinteId: nod.id, copilId: copil.id });
  }
  const pozitieUnit = (centre[0] + centre[centre.length - 1]) / 2;
  noduri.push({ ...nod, generatie, pozitieUnit });
  return Math.max(cursor - start, 1);
}
