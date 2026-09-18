import type { CreateSugestieValues, SugestiePrimita } from '../types/sugestie';
import { apiClient } from './client';

export async function trimiteSugestie(values: CreateSugestieValues): Promise<void> {
  await apiClient.post('/sugestii', values);
}

export async function getToateSugestiile(): Promise<SugestiePrimita[]> {
  const { data } = await apiClient.get('/sugestii');
  return data;
}
