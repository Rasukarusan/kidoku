import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * 任意認証用の GraphQL ガード。
 * X-User-Id ヘッダーがあれば認証してユーザー情報を request に載せるが、
 * 無い／不正でも例外を投げず未認証（user = undefined）として処理を継続する。
 * ログイン不要で利用できるエンドポイント（匿名いいね等）で使用する。
 */
@Injectable()
export class OptionalGqlAuthGuard extends AuthGuard('header') {
  getRequest(ctx: ExecutionContext) {
    return GqlExecutionContext.create(ctx).getContext().req;
  }

  // 認証失敗時も例外を投げず、未認証として通す
  handleRequest(err: any, user: any) {
    return user || undefined;
  }
}
