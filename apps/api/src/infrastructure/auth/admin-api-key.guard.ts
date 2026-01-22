import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

interface AuthenticatedRequest {
  headers: Record<string, string | string[] | undefined>;
  user?: { id: string; admin: boolean };
}

/**
 * 管理者用APIキー認証ガード
 *
 * 以下の順序で認証を試みる：
 * 1. x-admin-api-key ヘッダーによるAPIキー認証
 * 2. 通常のHMAC署名認証（フォールバック）
 *
 * いずれかが成功すれば認証成功とする
 */
@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  private readonly adminApiKey: string | undefined;
  private readonly secretKey: string;
  private readonly maxTimestampAge = 30000;

  constructor(private configService: ConfigService) {
    this.adminApiKey = this.configService.get<string>('ADMIN_API_KEY');
    const secret = this.configService.get<string>('NEXTAUTH_SECRET');
    if (!secret) {
      throw new Error('NEXTAUTH_SECRET is not configured');
    }
    this.secretKey = secret;
  }

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req as AuthenticatedRequest;

    // 1. APIキー認証を試みる
    const apiKey = req.headers['x-admin-api-key'] as string;
    if (apiKey && this.adminApiKey && apiKey === this.adminApiKey) {
      // APIキー認証成功：管理者としてユーザー情報を設定
      req.user = {
        id: 'admin-api-key',
        admin: true,
      };
      return true;
    }

    // 2. 通常のHMAC署名認証にフォールバック
    return this.validateHmacAuth(req);
  }

  private validateHmacAuth(req: AuthenticatedRequest): boolean {
    const userId = req.headers['x-user-id'] as string;
    const isAdmin = req.headers['x-user-admin'] as string;
    const timestamp = req.headers['x-timestamp'] as string;
    const signature = req.headers['x-signature'] as string;

    if (!userId || !timestamp || !signature) {
      throw new UnauthorizedException('Missing authentication headers');
    }

    const requestTime = parseInt(timestamp, 10);
    const currentTime = Date.now();

    if (
      isNaN(requestTime) ||
      Math.abs(currentTime - requestTime) > this.maxTimestampAge
    ) {
      throw new UnauthorizedException(
        'Request timestamp is invalid or expired',
      );
    }

    const expectedSignaturePayload = `${userId}:${isAdmin}:${timestamp}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(expectedSignaturePayload)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new UnauthorizedException('Invalid signature');
    }

    // HMAC認証成功
    req.user = {
      id: userId,
      admin: isAdmin === 'true',
    };

    return true;
  }
}
