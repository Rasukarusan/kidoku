import { UseGuards } from '@nestjs/common';
import { Query, Mutation, Resolver, Args } from '@nestjs/graphql';
import { GetMyTagsUseCase } from '../../application/usecases/tags/get-my-tags';
import { GetBookTagsUseCase } from '../../application/usecases/tags/get-book-tags';
import { GetBooksByTagUseCase } from '../../application/usecases/tags/get-books-by-tag';
import { SetBookTagsUseCase } from '../../application/usecases/tags/set-book-tags';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { GqlAuthGuard } from '../../infrastructure/auth/gql-auth.guard';
import {
  TagWithCountResponse,
  TaggedBookResponse,
  GetBookTagsInput,
  GetBooksByTagInput,
  SetBookTagsInput,
} from '../dto/tag';

@Resolver()
@UseGuards(GqlAuthGuard)
export class TagResolver {
  constructor(
    private readonly getMyTagsUseCase: GetMyTagsUseCase,
    private readonly getBookTagsUseCase: GetBookTagsUseCase,
    private readonly getBooksByTagUseCase: GetBooksByTagUseCase,
    private readonly setBookTagsUseCase: SetBookTagsUseCase,
  ) {}

  @Query(() => [TagWithCountResponse])
  async myTags(
    @CurrentUser() user: { id: string },
  ): Promise<TagWithCountResponse[]> {
    return await this.getMyTagsUseCase.execute(user.id);
  }

  @Query(() => [String])
  async bookTags(
    @CurrentUser() user: { id: string },
    @Args('input') input: GetBookTagsInput,
  ): Promise<string[]> {
    return await this.getBookTagsUseCase.execute(input.bookId, user.id);
  }

  @Query(() => [TaggedBookResponse])
  async booksByTag(
    @CurrentUser() user: { id: string },
    @Args('input') input: GetBooksByTagInput,
  ): Promise<TaggedBookResponse[]> {
    return await this.getBooksByTagUseCase.execute(user.id, input.tagName);
  }

  @Mutation(() => [String])
  async setBookTags(
    @CurrentUser() user: { id: string },
    @Args('input') input: SetBookTagsInput,
  ): Promise<string[]> {
    return await this.setBookTagsUseCase.execute({
      userId: user.id,
      bookId: input.bookId,
      tags: input.tags,
    });
  }
}
