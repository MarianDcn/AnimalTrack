import type { ArboreGenealogic } from '../types/arbore';
import { apiClient } from './client';

export async function getArbore(
  id: string,
  generatiiSus = 3,
  generatiiJos = 2,
): Promise<ArboreGenealogic> {
  const { data } = await apiClient.get<ArboreGenealogic>(`/pasari/${id}/arbore`, {
    params: { generatiiSus, generatiiJos },
  });
  return data;
}
