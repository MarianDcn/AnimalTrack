import type { CreateSugestieValues } from '../types/sugestie';
import { apiClient } from './client';

export async function trimiteSugestie(values: CreateSugestieValues): Promise<void> {
  await apiClient.post('/sugestii', values);
}
