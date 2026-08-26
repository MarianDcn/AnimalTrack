import type { Pasare, SexPasare } from './pasare';

export type StatusOu = 'DEPUS' | 'FECUNDAT' | 'NEFECUNDAT' | 'ECLOZAT' | 'PIERDUT';

export interface Ou {
  id: string;
  serieId: string;
  dataDepunere: string;
  status: StatusOu;
  pasareId: string | null;
  pasare?: Pasare | null;
}

export interface SerieCuibarit {
  id: string;
  perecheId: string;
  dataImperechere: string | null;
  dataPrimOu: string | null;
  dataCreare: string;
  oua: Ou[];
}

export interface CreateSerieValues {
  perecheId: string;
  dataImperechere?: string;
}

export interface CreateOuValues {
  dataDepunere?: string;
}

export interface EclozeazaValues {
  nrInel: string;
  nume?: string;
  dataEclozare?: string;
  sex?: SexPasare;
  mutatii?: string[];
  observatii?: string;
}
