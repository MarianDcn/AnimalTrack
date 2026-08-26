import type { SexPasare, StatusPasare } from './pasare';

export type StatusPereche = 'ACTIVA' | 'INACTIVA';

export interface PasareRezumat {
  id: string;
  nrInel: string;
  nume: string | null;
  sex: SexPasare;
  mutatii: string[];
  status: StatusPasare;
}

export interface Pereche {
  id: string;
  fermaId: string;
  masculId: string;
  femelaId: string;
  dataCreare: string;
  status: StatusPereche;
  mascul: PasareRezumat;
  femela: PasareRezumat;
}

export interface PerecheFormValues {
  masculId: string;
  femelaId: string;
  status?: StatusPereche;
}
