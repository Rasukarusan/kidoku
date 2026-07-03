import { UseGuards } from '@nestjs/common';
import { Query, Mutation, Resolver, Args } from '@nestjs/graphql';
import { GetFollowedAuthorsUseCase } from '../../application/usecases/author-follows/get-followed-authors';
import { FollowAuthorUseCase } from '../../application/usecases/author-follows/follow-author';
import { UnfollowAuthorUseCase } from '../../application/usecases/author-follows/unfollow-author';
import { GetAuthorNewReleasesUseCase } from '../../application/usecases/author-follows/get-author-new-releases';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { GqlAuthGuard } from '../../infrastructure/auth/gql-auth.guard';
import { AuthorFollow } from '../../domain/models/author-follow';
import {
  AuthorFollowResponse,
  AuthorNewReleaseResponse,
  FollowAuthorInput,
  UnfollowAuthorInput,
  GetAuthorNewReleasesInput,
} from '../dto/author-follow';

@Resolver()
@UseGuards(GqlAuthGuard)
export class AuthorFollowResolver {
  constructor(
    private readonly getFollowedAuthorsUseCase: GetFollowedAuthorsUseCase,
    private readonly followAuthorUseCase: FollowAuthorUseCase,
    private readonly unfollowAuthorUseCase: UnfollowAuthorUseCase,
    private readonly getAuthorNewReleasesUseCase: GetAuthorNewReleasesUseCase,
  ) {}

  @Query(() => [AuthorFollowResponse])
  async followedAuthors(
    @CurrentUser() user: { id: string },
  ): Promise<AuthorFollowResponse[]> {
    const follows = await this.getFollowedAuthorsUseCase.execute(user.id);
    return follows.map((follow) => this.toResponse(follow));
  }

  @Query(() => [AuthorNewReleaseResponse])
  async authorNewReleases(
    @Args('input') input: GetAuthorNewReleasesInput,
  ): Promise<AuthorNewReleaseResponse[]> {
    return await this.getAuthorNewReleasesUseCase.execute(input.authorName);
  }

  @Mutation(() => AuthorFollowResponse)
  async followAuthor(
    @CurrentUser() user: { id: string },
    @Args('input') input: FollowAuthorInput,
  ): Promise<AuthorFollowResponse> {
    const follow = await this.followAuthorUseCase.execute({
      userId: user.id,
      authorName: input.authorName,
    });
    return this.toResponse(follow);
  }

  @Mutation(() => Boolean)
  async unfollowAuthor(
    @CurrentUser() user: { id: string },
    @Args('input') input: UnfollowAuthorInput,
  ): Promise<boolean> {
    await this.unfollowAuthorUseCase.execute(input.id, user.id);
    return true;
  }

  private toResponse(follow: AuthorFollow): AuthorFollowResponse {
    return {
      id: follow.id ?? '',
      authorName: follow.authorName,
      created: follow.created,
    };
  }
}
