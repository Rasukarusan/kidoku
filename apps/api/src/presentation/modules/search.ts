import { Module } from '@nestjs/common';
import { SearchResolver } from '../resolvers/search';
import { SearchBooksUseCase } from '../../application/usecases/search/search-books';
import { SearchExternalBooksUseCase } from '../../application/usecases/search/search-external-books';
import { IndexAllBooksUseCase } from '../../application/usecases/search/index-all-books';
import { SearchRepository } from '../../infrastructure/repositories/search';
import { RakutenBooksRepository } from '../../infrastructure/repositories/rakuten-books';
import { BookRepository } from '../../infrastructure/repositories/book';
import { MeiliSearchProvider } from '../../infrastructure/search/meilisearch.providers';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { ISearchRepository } from '../../domain/repositories/search';
import { IBookSearchRepository } from '../../domain/repositories/book-search';
import { IBookRepository } from '../../domain/repositories/book';

@Module({
  imports: [AuthModule],
  providers: [
    SearchResolver,
    SearchBooksUseCase,
    SearchExternalBooksUseCase,
    IndexAllBooksUseCase,
    MeiliSearchProvider,
    {
      provide: ISearchRepository,
      useClass: SearchRepository,
    },
    {
      provide: IBookSearchRepository,
      useClass: RakutenBooksRepository,
    },
    {
      provide: IBookRepository,
      useClass: BookRepository,
    },
  ],
  exports: [ISearchRepository, MeiliSearchProvider],
})
export class SearchModule {}
