import { Module } from '@nestjs/common';
import { QuoteResolver } from '../resolvers/quote';
import { GetBookQuotesUseCase } from '../../application/usecases/quotes/get-book-quotes';
import { GetMyQuotesUseCase } from '../../application/usecases/quotes/get-my-quotes';
import { CreateQuoteUseCase } from '../../application/usecases/quotes/create-quote';
import { UpdateQuoteUseCase } from '../../application/usecases/quotes/update-quote';
import { DeleteQuoteUseCase } from '../../application/usecases/quotes/delete-quote';
import { QuoteRepository } from '../../infrastructure/repositories/quote';
import { BookRepository } from '../../infrastructure/repositories/book';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { IQuoteRepository } from '../../domain/repositories/quote';
import { IBookRepository } from '../../domain/repositories/book';

@Module({
  imports: [AuthModule],
  providers: [
    QuoteResolver,
    GetBookQuotesUseCase,
    GetMyQuotesUseCase,
    CreateQuoteUseCase,
    UpdateQuoteUseCase,
    DeleteQuoteUseCase,
    {
      provide: IQuoteRepository,
      useClass: QuoteRepository,
    },
    {
      provide: IBookRepository,
      useClass: BookRepository,
    },
  ],
})
export class QuoteModule {}
