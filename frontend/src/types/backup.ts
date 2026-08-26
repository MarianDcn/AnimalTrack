export interface BackupAutomatInfo {
  fisier: string;
  dataCreare: string;
  marime: number;
}

export interface RestoreRezultat {
  success: boolean;
  restaurat: {
    pasari: number;
    perechi: number;
    serii: number;
    oua: number;
  };
}
