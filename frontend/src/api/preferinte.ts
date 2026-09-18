import type { PreferinteInterfata } from '../preferinte/PreferinteContext';
import { apiClient } from './client';

export async function getPreferinteServer(): Promise<Partial<PreferinteInterfata>> {
  const { data } = await apiClient.get('/preferinte');
  return data;
}

export async function actualizeazaPreferinteServer(
  partiale: Partial<PreferinteInterfata>,
): Promise<Partial<PreferinteInterfata>> {
  const { data } = await apiClient.patch('/preferinte', partiale);
  return data;
}
