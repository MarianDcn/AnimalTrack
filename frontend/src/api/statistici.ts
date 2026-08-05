import type {
  PasariPeMutatie,
  ProductieParinte,
  ProductiePereche,
  PuiPeAn,
} from '../types/statistici';
import { apiClient } from './client';

export async function getPasariPeMutatie(): Promise<PasariPeMutatie[]> {
  const { data } = await apiClient.get<PasariPeMutatie[]>('/statistici/pasari-pe-mutatie');
  return data;
}

export async function getPuiPeAn(): Promise<PuiPeAn[]> {
  const { data } = await apiClient.get<PuiPeAn[]>('/statistici/pui-pe-an');
  return data;
}

export async function getProductiePerechi(an?: number): Promise<ProductiePereche[]> {
  const { data } = await apiClient.get<ProductiePereche[]>('/statistici/productie-perechi', {
    params: an ? { an } : {},
  });
  return data;
}

export async function getProductieMasculi(an?: number): Promise<ProductieParinte[]> {
  const { data } = await apiClient.get<ProductieParinte[]>('/statistici/productie-masculi', {
    params: an ? { an } : {},
  });
  return data;
}

export async function getProductieFemele(an?: number): Promise<ProductieParinte[]> {
  const { data } = await apiClient.get<ProductieParinte[]>('/statistici/productie-femele', {
    params: an ? { an } : {},
  });
  return data;
}
