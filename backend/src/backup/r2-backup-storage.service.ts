import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

export interface BackupAutoInfo {
  cheie: string;
  dataCreare: Date;
  marime: number;
}

@Injectable()
export class R2BackupStorageService {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(config: ConfigService) {
    this.bucket = config.get<string>('R2_BACKUP_BUCKET_NAME')!;

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.get<string>('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.get<string>('R2_ACCESS_KEY_ID')!,
        secretAccessKey: config.get<string>('R2_SECRET_ACCESS_KEY')!,
      },
    });
  }

  private prefix(fermaId: string) {
    return `backups/${fermaId}/`;
  }

  async upload(fermaId: string, continutJson: string): Promise<string> {
    const cheie = `${this.prefix(fermaId)}${Date.now()}.json`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: cheie,
        Body: continutJson,
        ContentType: 'application/json',
      }),
    );
    return cheie;
  }

  async listeaza(fermaId: string): Promise<BackupAutoInfo[]> {
    const rezultat = await this.client.send(
      new ListObjectsV2Command({ Bucket: this.bucket, Prefix: this.prefix(fermaId) }),
    );

    return (rezultat.Contents ?? [])
      .filter((o) => o.Key)
      .map((o) => ({
        cheie: o.Key!,
        dataCreare: o.LastModified ?? new Date(0),
        marime: o.Size ?? 0,
      }))
      .sort((a, b) => b.dataCreare.getTime() - a.dataCreare.getTime());
  }

  async descarca(cheie: string): Promise<string> {
    const rezultat = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: cheie }),
    );
    const continut = await rezultat.Body?.transformToString();
    if (!continut) {
      throw new Error('Backup gol sau ilizibil');
    }
    return continut;
  }

  async sterge(cheie: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: cheie }));
  }

  /** Sterge toate backup-urile automate mai vechi decat ultimele `pastreaza`. */
  async pastreazaDoarUltimele(fermaId: string, pastreaza: number): Promise<void> {
    const toate = await this.listeaza(fermaId);
    const vechi = toate.slice(pastreaza);
    for (const b of vechi) {
      await this.sterge(b.cheie);
    }
  }

  /** Verifica ca o cheie chiar apartine fermei date, inainte de a o descarca/sterge. */
  apartineFermei(cheie: string, fermaId: string): boolean {
    return cheie.startsWith(this.prefix(fermaId));
  }
}
