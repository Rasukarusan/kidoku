import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { AdminApiKeyGuard } from '../../infrastructure/auth/admin-api-key.guard';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { SearchBooksUseCase } from '../../application/usecases/search/search-books';
import { SearchGoogleBooksUseCase } from '../../application/usecases/search/search-google-books';
import { IndexAllBooksUseCase } from '../../application/usecases/search/index-all-books';
import {
  SearchBooksInput,
  SearchBooksResponse,
  SearchHitResponse,
  SearchGoogleBooksInput,
  GoogleBookHitResponse,
  IndexBooksResponse,
} from '../dto/search';

@Resolver()
export class SearchResolver {
  constructor(
    private readonly searchBooksUseCase: SearchBooksUseCase,
    private readonly searchGoogleBooksUseCase: SearchGoogleBooksUseCase,
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

  @Query(() => [GoogleBookHitResponse])
  async searchGoogleBooks(
    @Args('input') input: SearchGoogleBooksInput,
  ): Promise<GoogleBookHitResponse[]> {
    return await this.searchGoogleBooksUseCase.execute(input.query);
  }

  @Mutation(() => IndexBooksResponse)
  @UseGuards(AdminApiKeyGuard)
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
