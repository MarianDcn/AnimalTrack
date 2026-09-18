export interface CreateSugestieValues {
  mesaj: string;
}

export interface SugestiePrimita {
  id: string;
  mesaj: string;
  dataCreare: string;
  ferma: { nume: string };
  utilizator: { email: string };
}
