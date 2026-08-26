import type { BackupAutomatInfo, RestoreRezultat } from '../types/backup';
import { apiClient } from './client';
import { descarcaRaspuns } from '../utils/download';

export async function exportBackup(): Promise<void> {
  const response = await apiClient.get('/backup/export', { responseType: 'blob' });
  descarcaRaspuns(response);
}

export async function restoreBackup(fisier: File): Promise<RestoreRezultat> {
  const formData = new FormData();
  formData.append('fisier', fisier);
  formData.append('confirmare', 'CONFIRM');

  const { data } = await apiClient.post<RestoreRezultat>('/backup/restore', formData);
  return data;
}

export async function getBackupuriAutomate(): Promise<BackupAutomatInfo[]> {
  const { data } = await apiClient.get<BackupAutomatInfo[]>('/backup/auto');
  return data;
}

export async function descarcaBackupAutomat(fisier: string): Promise<void> {
  const response = await apiClient.get(`/backup/auto/${fisier}`, { responseType: 'blob' });
  descarcaRaspuns(response);
}
