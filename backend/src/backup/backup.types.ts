export interface BackupPasare {
  id: string;
  nrInel: string;
  rnc: string | null;
  dataEclozare: string | Date | null;
  sex: string;
  mutatii: string[];
  tataId: string | null;
  mamaId: string | null;
  observatii: string | null;
  status: string;
  achizitionataDinAfara: boolean;
  dataCreare: string | Date;
}

export interface BackupPereche {
  id: string;
  masculId: string;
  femelaId: string;
  status: string;
  dataCreare: string | Date;
}

export interface BackupSerie {
  id: string;
  perecheId: string;
  dataImperechere: string | Date | null;
  dataPrimOu: string | Date | null;
  dataCreare: string | Date;
}

export interface BackupOu {
  id: string;
  serieId: string;
  dataDepunere: string | Date;
  status: string;
  pasareId: string | null;
}

export interface BackupData {
  versiune: number;
  dataExport: string;
  fermaNume: string;
  pasari: BackupPasare[];
  perechi: BackupPereche[];
  serii: BackupSerie[];
  oua: BackupOu[];
}
