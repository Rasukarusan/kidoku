import { Module } from '@nestjs/common';
import { BookResolver } from '../resolvers/book';
import { CreateBookUseCase } from '../../application/usecases/books/create-book';
import { UpdateBookUseCase } from '../../application/usecases/books/update-book';
import { DeleteBookUseCase } from '../../application/usecases/books/delete-book';
import { GetBookUseCase } from '../../application/usecases/books/get-book';
import { GetBooksUseCase } from '../../application/usecases/books/get-books';
import { GetBookCategoriesUseCase } from '../../application/usecases/books/get-book-categories';
import { BookRepository } from '../../infrastructure/repositories/book';
import { SearchRepository } from '../../infrastructure/repositories/search';
import { MeiliSearchProvider } from '../../infrastructure/search/meilisearch.providers';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { IBookRepository } from '../../domain/repositories/book';
import { ISearchRepository } from '../../domain/repositories/search';

@Module({
  imports: [AuthModule],
  providers: [
    BookResolver,
    CreateBookUseCase,
    UpdateBookUseCase,
    DeleteBookUseCase,
    GetBookUseCase,
    GetBooksUseCase,
    GetBookCategoriesUseCase,
    MeiliSearchProvider,
    {
      provide: IBookRepository,
      useClass: BookRepository,
    },
    {
      provide: ISearchRepository,
      useClass: SearchRepository,
    },
  ],
})
export class BookModule {}
