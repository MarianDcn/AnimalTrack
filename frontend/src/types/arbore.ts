import type { SexPasare } from './pasare';

export interface NodArbore {
  id: string;
  nrInel: string;
  nume: string | null;
  sex: SexPasare;
  mutatie: string | null;
  dataEclozare: string | null;
}

export interface NodStramos extends NodArbore {
  tata: NodStramos | null;
  mama: NodStramos | null;
}

export interface NodDescendent extends NodArbore {
  copii: NodDescendent[];
}

export interface ArboreGenealogic {
  pasare: NodArbore;
  stramosi: { tata: NodStramos | null; mama: NodStramos | null };
  descendenti: NodDescendent[];
}
