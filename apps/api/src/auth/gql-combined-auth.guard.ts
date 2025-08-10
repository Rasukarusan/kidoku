import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * JWT認証とヘッダー認証の両方をサポートする統合ガード
 * まずヘッダー認証を試み、失敗した場合はJWT認証を試みる
 */
@Injectable()
export class GqlCombinedAuthGuard extends AuthGuard(['header', 'jwt']) {
  getRequest(ctx: ExecutionContext) {
    return GqlExecutionContext.create(ctx).getContext().req;
  }
}