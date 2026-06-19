import { UseGuards } from '@nestjs/common';
import { Query, Mutation, Resolver, Args } from '@nestjs/graphql';
import { GqlAuthGuard } from '../../infrastructure/auth/gql-auth.guard';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { FollowUserUseCase } from '../../application/usecases/follows/follow-user';
import { UnfollowUserUseCase } from '../../application/usecases/follows/unfollow-user';
import { GetFollowInfoUseCase } from '../../application/usecases/follows/get-follow-info';
import { GetFeedUseCase } from '../../application/usecases/follows/get-feed';
import {
  FollowUserInput,
  GetFollowInfoInput,
  GetFeedInput,
  FollowInfoResponse,
  FeedResponse,
  FeedBookItem,
} from '../dto/follow';

@Resolver()
export class FollowResolver {
  constructor(
    private readonly followUserUseCase: FollowUserUseCase,
    private readonly unfollowUserUseCase: UnfollowUserUseCase,
    private readonly getFollowInfoUseCase: GetFollowInfoUseCase,
    private readonly getFeedUseCase: GetFeedUseCase,
  ) {}

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async followUser(
    @CurrentUser() user: { id: string },
    @Args('input') input: FollowUserInput,
  ): Promise<boolean> {
    return this.followUserUseCase.execute(user.id, input.userId);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async unfollowUser(
    @CurrentUser() user: { id: string },
    @Args('input') input: FollowUserInput,
  ): Promise<boolean> {
    return this.unfollowUserUseCase.execute(user.id, input.userId);
  }

  @Query(() => FollowInfoResponse)
  @UseGuards(GqlAuthGuard)
  async followInfo(
    @CurrentUser() user: { id: string },
    @Args('input') input: GetFollowInfoInput,
  ): Promise<FollowInfoResponse> {
    return this.getFollowInfoUseCase.execute(input.name, user.id);
  }

  /** 公開用のフォロー数取得（未ログインでも閲覧可。isFollowingは常にfalse） */
  @Query(() => FollowInfoResponse)
  async followCounts(
    @Args('input') input: GetFollowInfoInput,
  ): Promise<FollowInfoResponse> {
    return this.getFollowInfoUseCase.execute(input.name);
  }

  @Query(() => FeedResponse)
  @UseGuards(GqlAuthGuard)
  async feed(
    @CurrentUser() user: { id: string },
    @Args('input') input: GetFeedInput,
  ): Promise<FeedResponse> {
    const result = await this.getFeedUseCase.execute(
      user.id,
      input.limit,
      input.offset,
    );
    return {
      books: result.items.map(
        (b): FeedBookItem => ({
          id: b.id.toString(),
          title: b.title,
          author: b.author,
          memo: b.memo,
          image: b.image,
          updated: b.updated,
          username: b.username,
          userImage: b.userImage ?? undefined,
          sheet: b.sheet,
          likeCount: b.likeCount,
        }),
      ),
      total: result.total,
      hasMore: result.hasMore,
    };
  }
}
