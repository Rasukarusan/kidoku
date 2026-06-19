import { UseGuards } from '@nestjs/common';
import { Query, Mutation, Resolver, Args, Int } from '@nestjs/graphql';
import { GqlAuthGuard } from '../../infrastructure/auth/gql-auth.guard';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
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
  @UseGuards(GqlAuthGuard)
  async likeBook(
    @CurrentUser() user: { id: string },
    @Args('input') input: LikeBookInput,
  ): Promise<number> {
    return this.likeBookUseCase.execute(user.id, input.bookId);
  }

  @Mutation(() => Int)
  @UseGuards(GqlAuthGuard)
  async unlikeBook(
    @CurrentUser() user: { id: string },
    @Args('input') input: LikeBookInput,
  ): Promise<number> {
    return this.unlikeBookUseCase.execute(user.id, input.bookId);
  }

  @Query(() => [Int])
  @UseGuards(GqlAuthGuard)
  async myLikedBookIds(@CurrentUser() user: { id: string }): Promise<number[]> {
    return this.getMyLikedBookIdsUseCase.execute(user.id);
  }
}
