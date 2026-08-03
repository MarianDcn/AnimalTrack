export type SexPasare = 'MASCUL' | 'FEMELA' | 'NECUNOSCUT';

export type StatusPasare = 'ACTIVA' | 'VANDUTA' | 'DECEDATA' | 'TRANSFERATA';

export interface Pasare {
  id: string;
  fermaId: string;
  nrInel: string;
  nume: string | null;
  dataEclozare: string | null;
  sex: SexPasare;
  mutatie: string | null;
  culoare: string | null;
  tataId: string | null;
  mamaId: string | null;
  observatii: string | null;
  status: StatusPasare;
  dataCreare: string;
}

export interface PasareFormValues {
  nrInel: string;
  nume?: string;
  dataEclozare?: string;
  sex?: SexPasare;
  mutatie?: string;
  culoare?: string;
  tataId?: string;
  mamaId?: string;
  observatii?: string;
  status?: StatusPasare;
}

export interface PasareCautareRezultat {
  id: string;
  nrInel: string;
  nume: string | null;
  dataEclozare: string | null;
  varsta: { ani: number; luni: number } | null;
  sex: SexPasare;
  mutatie: string | null;
  tata: { id: string; nrInel: string } | null;
  mama: { id: string; nrInel: string } | null;
}
