import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { GqlAuthGuard } from '../../infrastructure/auth/gql-auth.guard';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { SearchBooksUseCase } from '../../application/usecases/search/search-books';
import { IndexAllBooksUseCase } from '../../application/usecases/search/index-all-books';
import {
  SearchBooksInput,
  SearchBooksResponse,
  SearchHitResponse,
  IndexBooksResponse,
} from '../dto/search';

@Resolver()
export class SearchResolver {
  constructor(
    private readonly searchBooksUseCase: SearchBooksUseCase,
    private readonly indexAllBooksUseCase: IndexAllBooksUseCase,
  ) {}

  @Query(() => SearchBooksResponse)
  async searchBooks(
    @Args('input') input: SearchBooksInput,
  ): Promise<SearchBooksResponse> {
    const result = await this.searchBooksUseCase.execute(
      input.query,
      input.page || 1,
    );

    const hits: SearchHitResponse[] = result.hits.map((hit) => ({
      id: hit.id,
      title: hit.title,
      author: hit.author,
      image: hit.image,
      memo: hit.memo,
      username: hit.username,
      userImage: hit.userImage || undefined,
      sheet: hit.sheet,
    }));

    return {
      hits,
      totalHits: result.totalHits,
      hitsPerPage: result.hitsPerPage,
      page: result.page,
      hasMore: result.hasMore,
    };
  }

  @Mutation(() => IndexBooksResponse)
  @UseGuards(GqlAuthGuard)
  async indexAllBooks(
    @CurrentUser() user: { id: string; admin: boolean },
  ): Promise<IndexBooksResponse> {
    if (!user.admin) {
      throw new ForbiddenException('管理者のみがインデックスを更新できます');
    }

    const result = await this.indexAllBooksUseCase.execute();
    return { count: result.count };
  }
}
