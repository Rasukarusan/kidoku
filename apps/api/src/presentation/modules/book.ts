import { Module } from '@nestjs/common';
import { BookResolver } from '../resolvers/book';
import { CreateBookUseCase } from '../../application/usecases/books/create-book';
import { UpdateBookUseCase } from '../../application/usecases/books/update-book';
import { DeleteBookUseCase } from '../../application/usecases/books/delete-book';
import { GetBookUseCase } from '../../application/usecases/books/get-book';
import { GetBooksUseCase } from '../../application/usecases/books/get-books';
import { GetBookCategoriesUseCase } from '../../application/usecases/books/get-book-categories';
import { BookRepository } from '../../infrastructure/repositories/book';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { IBookRepository } from '../../domain/repositories/book';

@Module({
  imports: [AuthModule, DatabaseModule],
  providers: [
    BookResolver,
    CreateBookUseCase,
    UpdateBookUseCase,
    DeleteBookUseCase,
    GetBookUseCase,
    GetBooksUseCase,
    GetBookCategoriesUseCase,
    {
      provide: IBookRepository,
      useClass: BookRepository,
    },
  ],
})
export class BookModule {}
