import { Module } from '@nestjs/common';
import { SearchResolver } from '../resolvers/search';
import { SearchBooksUseCase } from '../../application/usecases/search/search-books';
import { SearchGoogleBooksUseCase } from '../../application/usecases/search/search-google-books';
import { IndexAllBooksUseCase } from '../../application/usecases/search/index-all-books';
import { SearchRepository } from '../../infrastructure/repositories/search';
import { GoogleBooksRepository } from '../../infrastructure/repositories/google-books';
import { BookRepository } from '../../infrastructure/repositories/book';
import { MeiliSearchProvider } from '../../infrastructure/search/meilisearch.providers';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { ISearchRepository } from '../../domain/repositories/search';
import { IGoogleBooksRepository } from '../../domain/repositories/google-books';
import { IBookRepository } from '../../domain/repositories/book';

@Module({
  imports: [AuthModule, DatabaseModule],
  providers: [
    SearchResolver,
    SearchBooksUseCase,
    SearchGoogleBooksUseCase,
    IndexAllBooksUseCase,
    MeiliSearchProvider,
    {
      provide: ISearchRepository,
      useClass: SearchRepository,
    },
    {
      provide: IGoogleBooksRepository,
      useClass: GoogleBooksRepository,
    },
    {
      provide: IBookRepository,
      useClass: BookRepository,
    },
  ],
  exports: [ISearchRepository, MeiliSearchProvider],
})
export class SearchModule {}
