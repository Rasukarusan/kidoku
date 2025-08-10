import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class HeaderStrategy extends PassportStrategy(Strategy, 'header') {
  private readonly secretKey: string;
  private readonly maxTimestampAge = 30000; // 30秒（リプレイ攻撃防止）

  constructor(private configService: ConfigService) {
    super();
    // NEXTAUTH_SECRETを署名検証にも使用
    const secret = this.configService.get<string>('NEXTAUTH_SECRET');
    
    if (!secret) {
      throw new Error('NEXTAUTH_SECRET is not configured');
    }
    
    this.secretKey = secret;
  }

  async validate(req: Request): Promise<any> {
    // Next.jsのプロキシから送信されるヘッダーを取得
    const userId = req.headers['x-user-id'] as string;
    const isAdmin = req.headers['x-user-admin'] as string;
    const timestamp = req.headers['x-timestamp'] as string;
    const signature = req.headers['x-signature'] as string;

    // 必須ヘッダーの確認
    if (!userId || !timestamp || !signature) {
      throw new UnauthorizedException('Missing authentication headers');
    }

    // タイムスタンプの検証（リプレイ攻撃防止）
    const requestTime = parseInt(timestamp, 10);
    const currentTime = Date.now();
    
    if (isNaN(requestTime) || Math.abs(currentTime - requestTime) > this.maxTimestampAge) {
      throw new UnauthorizedException('Request timestamp is invalid or expired');
    }

    // 署名の検証
    const expectedSignaturePayload = `${userId}:${isAdmin}:${timestamp}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(expectedSignaturePayload)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new UnauthorizedException('Invalid signature');
    }

    // 認証成功：ユーザー情報を返す
    return {
      id: userId,
      admin: isAdmin === 'true',
    };
  }
}