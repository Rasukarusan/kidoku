import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';

/**
 * トークンをDBに平文で置かないためのAES-256-GCM暗号化。
 * 鍵はNEXTAUTH_SECRETから派生するため、シークレットを変更すると復号できなくなり再ログインが必要になる。
 */
@Injectable()
export class TokenCipher {
  private readonly key: Buffer;

  constructor(configService: ConfigService) {
    const secret = configService.get<string>('NEXTAUTH_SECRET');
    if (!secret) {
      throw new Error('NEXTAUTH_SECRET is not configured');
    }
    this.key = createHash('sha256').update(secret).digest();
  }

  /** 平文 -> "base64(iv):base64(tag):base64(ciphertext)" */
  encrypt(plain: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plain, 'utf8'),
      cipher.final(),
    ]);
    return [
      iv.toString('base64'),
      cipher.getAuthTag().toString('base64'),
      encrypted.toString('base64'),
    ].join(':');
  }

  decrypt(payload: string): string {
    const [iv, tag, data] = payload.split(':');
    if (!iv || !tag || !data) {
      throw new Error('Invalid encrypted payload');
    }
    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.key,
      Buffer.from(iv, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    return Buffer.concat([
      decipher.update(Buffer.from(data, 'base64')),
      decipher.final(),
    ]).toString('utf8');
  }
}
