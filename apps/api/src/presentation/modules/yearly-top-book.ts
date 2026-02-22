import { Module } from '@nestjs/common';
import { YearlyTopBookResolver } from '../resolvers/yearly-top-book';
import { GetYearlyTopBooksUseCase } from '../../application/usecases/yearly-top-books/get-yearly-top-books';
import { UpsertYearlyTopBookUseCase } from '../../application/usecases/yearly-top-books/upsert-yearly-top-book';
import { DeleteYearlyTopBookUseCase } from '../../application/usecases/yearly-top-books/delete-yearly-top-book';
import { YearlyTopBookRepository } from '../../infrastructure/repositories/yearly-top-book';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { IYearlyTopBookRepository } from '../../domain/repositories/yearly-top-book';

@Module({
  imports: [AuthModule],
  providers: [
    YearlyTopBookResolver,
    GetYearlyTopBooksUseCase,
    UpsertYearlyTopBookUseCase,
    DeleteYearlyTopBookUseCase,
    {
      provide: IYearlyTopBookRepository,
      useClass: YearlyTopBookRepository,
    },
  ],
})
export class YearlyTopBookModule {}
