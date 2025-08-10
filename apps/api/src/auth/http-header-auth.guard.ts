import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * HTTP REST API用の認証ガード
 * X-User-Idヘッダーによる認証をサポート
 */
@Injectable()
export class HttpHeaderAuthGuard extends AuthGuard('header') {}
