import type {
  CreateOuValues,
  CreateSerieValues,
  EclozeazaValues,
  Ou,
  SerieCuibarit,
  StatusOu,
} from '../types/cuibarit';
import { apiClient } from './client';

export async function creazaSerie(values: CreateSerieValues): Promise<SerieCuibarit> {
  const { data } = await apiClient.post<SerieCuibarit>('/serii', values);
  return data;
}

export async function getSerie(id: string): Promise<SerieCuibarit> {
  const { data } = await apiClient.get<SerieCuibarit>(`/serii/${id}`);
  return data;
}

export async function adaugaOu(serieId: string, values: CreateOuValues): Promise<Ou> {
  const { data } = await apiClient.post<Ou>(`/serii/${serieId}/oua`, values);
  return data;
}

export async function actualizeazaStatusOu(id: string, status: StatusOu): Promise<Ou> {
  const { data } = await apiClient.patch<Ou>(`/oua/${id}`, { status });
  return data;
}

export async function eclozeazaOu(id: string, values: EclozeazaValues): Promise<Ou> {
  const { data } = await apiClient.post<Ou>(`/oua/${id}/eclozeaza`, values);
  return data;
}
