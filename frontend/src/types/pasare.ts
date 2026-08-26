export type SexPasare = 'MASCUL' | 'FEMELA' | 'NECUNOSCUT';

export type StatusPasare = 'ACTIVA' | 'VANDUTA' | 'DONATA' | 'DECEDATA' | 'TRANSFERATA';

export interface Pasare {
  id: string;
  fermaId: string;
  nrInel: string;
  nume: string | null;
  dataEclozare: string | null;
  sex: SexPasare;
  mutatii: string[];
  tataId: string | null;
  mamaId: string | null;
  observatii: string | null;
  status: StatusPasare;
  achizitionataDinAfara: boolean;
  dataCreare: string;
}

export interface PasareFormValues {
  nrInel: string;
  nume?: string;
  dataEclozare?: string;
  sex?: SexPasare;
  mutatii?: string[];
  tataId?: string;
  mamaId?: string;
  observatii?: string;
  status?: StatusPasare;
  achizitionataDinAfara?: boolean;
}

export interface PasareCautareRezultat {
  id: string;
  nrInel: string;
  nume: string | null;
  dataEclozare: string | null;
  varsta: { ani: number; luni: number } | null;
  sex: SexPasare;
  mutatii: string[];
  tata: { id: string; nrInel: string } | null;
  mama: { id: string; nrInel: string } | null;
}
