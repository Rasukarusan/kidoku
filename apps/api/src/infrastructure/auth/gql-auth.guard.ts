import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * GraphQL用の認証ガード
 * X-User-Idヘッダーによる認証のみをサポート
 */
@Injectable()
export class GqlAuthGuard extends AuthGuard('header') {
  getRequest(ctx: ExecutionContext) {
    return GqlExecutionContext.create(ctx).getContext().req;
  }
}
