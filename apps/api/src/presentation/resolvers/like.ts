import { BadRequestException, UseGuards } from '@nestjs/common';
import { Query, Mutation, Resolver, Args, Int } from '@nestjs/graphql';
import { OptionalGqlAuthGuard } from '../../infrastructure/auth/optional-gql-auth.guard';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { LikeActor } from '../../domain/repositories/like';
import { LikeBookUseCase } from '../../application/usecases/likes/like-book';
import { UnlikeBookUseCase } from '../../application/usecases/likes/unlike-book';
import { GetMyLikedBookIdsUseCase } from '../../application/usecases/likes/get-my-liked-book-ids';
import { LikeBookInput } from '../dto/like';

@Resolver()
export class LikeResolver {
  constructor(
    private readonly likeBookUseCase: LikeBookUseCase,
    private readonly unlikeBookUseCase: UnlikeBookUseCase,
    private readonly getMyLikedBookIdsUseCase: GetMyLikedBookIdsUseCase,
  ) {}

  @Mutation(() => Int)
  @UseGuards(OptionalGqlAuthGuard)
  async likeBook(
    @CurrentUser() user: { id: string } | undefined,
    @Args('input') input: LikeBookInput,
  ): Promise<number> {
    const actor = this.resolveActor(user, input.anonymousId);
    return this.likeBookUseCase.execute(actor, input.bookId);
  }

  @Mutation(() => Int)
  @UseGuards(OptionalGqlAuthGuard)
  async unlikeBook(
    @CurrentUser() user: { id: string } | undefined,
    @Args('input') input: LikeBookInput,
  ): Promise<number> {
    const actor = this.resolveActor(user, input.anonymousId);
    return this.unlikeBookUseCase.execute(actor, input.bookId);
  }

  @Query(() => [Int])
  @UseGuards(OptionalGqlAuthGuard)
  async myLikedBookIds(
    @CurrentUser() user: { id: string } | undefined,
    @Args('anonymousId', { type: () => String, nullable: true })
    anonymousId?: string,
  ): Promise<number[]> {
    if (user?.id) {
      return this.getMyLikedBookIdsUseCase.execute({
        kind: 'user',
        userId: user.id,
      });
    }
    if (anonymousId) {
      return this.getMyLikedBookIdsUseCase.execute({
        kind: 'anonymous',
        anonymousId,
      });
    }
    return [];
  }

  /** ログインユーザーは userId、未ログインは anonymousId から操作主体を決定する */
  private resolveActor(
    user: { id: string } | undefined,
    anonymousId?: string,
  ): LikeActor {
    if (user?.id) return { kind: 'user', userId: user.id };
    if (anonymousId) return { kind: 'anonymous', anonymousId };
    throw new BadRequestException(
      'anonymousId is required for unauthenticated like',
    );
  }
}
