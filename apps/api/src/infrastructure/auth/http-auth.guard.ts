import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * REST(HTTP)エンドポイント用の認証ガード
 * X-User-Idヘッダーによる署名認証のみをサポート
 */
@Injectable()
export class HttpAuthGuard extends AuthGuard('header') {}
