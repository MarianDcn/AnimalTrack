import type { Pereche, PerecheFormValues } from '../types/pereche';
import type { SerieCuibarit } from '../types/cuibarit';
import { apiClient } from './client';

export async function getPerechi(): Promise<Pereche[]> {
  const { data } = await apiClient.get<Pereche[]>('/perechi');
  return data;
}

export async function getPereche(id: string): Promise<Pereche> {
  const { data } = await apiClient.get<Pereche>(`/perechi/${id}`);
  return data;
}

export async function creazaPereche(values: PerecheFormValues): Promise<Pereche> {
  const { data } = await apiClient.post<Pereche>('/perechi', values);
  return data;
}

export async function actualizeazaPereche(
  id: string,
  values: Partial<PerecheFormValues>,
): Promise<Pereche> {
  const { data } = await apiClient.patch<Pereche>(`/perechi/${id}`, values);
  return data;
}

export async function stergePereche(id: string): Promise<void> {
  await apiClient.delete(`/perechi/${id}`);
}

export async function getSeriiPereche(id: string): Promise<SerieCuibarit[]> {
  const { data } = await apiClient.get<SerieCuibarit[]>(`/perechi/${id}/serii`);
  return data;
}
