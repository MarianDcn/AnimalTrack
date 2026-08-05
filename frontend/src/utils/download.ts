import type { AxiosResponse } from 'axios';

export function descarcaRaspuns(response: AxiosResponse<Blob>) {
  const contentDisposition = response.headers['content-disposition'] as string | undefined;
  const match = contentDisposition?.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] ?? 'fisier';

  const url = URL.createObjectURL(response.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
