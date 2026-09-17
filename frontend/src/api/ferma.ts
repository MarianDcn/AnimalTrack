import { apiClient } from './client';

export async function actualizeazaFerma(nume: string): Promise<{ id: string; nume: string }> {
  const { data } = await apiClient.patch('/ferma', { nume });
  return data;
}
