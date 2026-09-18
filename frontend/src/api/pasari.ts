import type { Pasare, PasareCautareRezultat, PasareFormValues } from '../types/pasare';
import { apiClient } from './client';
import { descarcaRaspuns } from '../utils/download';

export async function getPasari(): Promise<Pasare[]> {
  const { data } = await apiClient.get<Pasare[]>('/pasari');
  return data;
}

export async function getPasare(id: string): Promise<Pasare> {
  const { data } = await apiClient.get<Pasare>(`/pasari/${id}`);
  return data;
}

export async function creazaPasare(values: PasareFormValues): Promise<Pasare> {
  const { data } = await apiClient.post<Pasare>('/pasari', values);
  return data;
}

export async function actualizeazaPasare(id: string, values: PasareFormValues): Promise<Pasare> {
  const { data } = await apiClient.patch<Pasare>(`/pasari/${id}`, values);
  return data;
}

export async function stergePasare(id: string): Promise<void> {
  await apiClient.delete(`/pasari/${id}`);
}

export async function cautaPasariDupaInel(nrInel: string): Promise<PasareCautareRezultat[]> {
  const { data } = await apiClient.get<PasareCautareRezultat[]>('/pasari/cautare', {
    params: { nrInel },
  });
  return data;
}

export interface RudePasare {
  frati: Pasare[];
  pui: Pasare[];
}

export async function getRudePasare(id: string): Promise<RudePasare> {
  const { data } = await apiClient.get<RudePasare>(`/pasari/${id}/rude`);
  return data;
}

export async function exportPasarePdf(id: string): Promise<void> {
  const response = await apiClient.get(`/pasari/${id}/export-pdf`, { responseType: 'blob' });
  descarcaRaspuns(response);
}

export async function exportArborePdf(
  id: string,
  mod: 'stramosi' | 'descendenti',
): Promise<void> {
  const response = await apiClient.get(`/pasari/${id}/export-arbore-pdf`, {
    params: { mod },
    responseType: 'blob',
  });
  descarcaRaspuns(response);
}

export async function exportPasariExcel(): Promise<void> {
  const response = await apiClient.get('/pasari/export-excel', { responseType: 'blob' });
  descarcaRaspuns(response);
}
