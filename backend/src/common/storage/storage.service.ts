import { Injectable } from '@nestjs/common';
import { Client } from 'minio';

// MinIO (dev) and Cloudflare R2 (prod) both speak the S3 API, and the
// minio-js client works against either — only STORAGE_ENDPOINT/KEY/SECRET/
// REGION differ between environments. No code branch needed to "swap".
@Injectable()
export class StorageService {
  private client: Client;
  private bucket: string;

  constructor() {
    const endpoint = new URL(
      process.env.STORAGE_ENDPOINT || process.env.MINIO_ENDPOINT || 'http://minio:9000',
    );
    this.bucket = process.env.STORAGE_BUCKET || process.env.MINIO_BUCKET || 'audio-files';
    this.client = new Client({
      endPoint: endpoint.hostname,
      port: endpoint.port ? Number(endpoint.port) : endpoint.protocol === 'https:' ? 443 : 9000,
      useSSL: endpoint.protocol === 'https:',
      accessKey: process.env.STORAGE_ACCESS_KEY || process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.STORAGE_SECRET_KEY || process.env.MINIO_SECRET_KEY || 'minioadmin',
      region: process.env.STORAGE_REGION || process.env.MINIO_REGION || undefined,
    });
  }

  async ensureBucket() {
    const exists = await this.client.bucketExists(this.bucket).catch(() => false);
    if (!exists) await this.client.makeBucket(this.bucket);
  }

  async put(key: string, data: Buffer, size: number, contentType?: string) {
    await this.ensureBucket();
    await this.client.putObject(this.bucket, key, data, size, {
      ...(contentType && { 'Content-Type': contentType }),
    });
  }

  async getObject(key: string) {
    return this.client.getObject(this.bucket, key);
  }

  async remove(key: string) {
    await this.client.removeObject(this.bucket, key);
  }

  async signedUrl(key: string, expirySeconds = 3600) {
    return this.client.presignedGetObject(this.bucket, key, expirySeconds);
  }
}
