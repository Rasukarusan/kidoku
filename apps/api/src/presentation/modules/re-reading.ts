import { Module } from '@nestjs/common';
import { ReReadingResolver } from '../resolvers/re-reading';
import { GetBookReReadingsUseCase } from '../../application/usecases/re-readings/get-book-re-readings';
import { CreateReReadingUseCase } from '../../application/usecases/re-readings/create-re-reading';
import { DeleteReReadingUseCase } from '../../application/usecases/re-readings/delete-re-reading';
import { ReReadingRepository } from '../../infrastructure/repositories/re-reading';
import { BookRepository } from '../../infrastructure/repositories/book';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { IReReadingRepository } from '../../domain/repositories/re-reading';
import { IBookRepository } from '../../domain/repositories/book';

@Module({
  imports: [AuthModule],
  providers: [
    ReReadingResolver,
    GetBookReReadingsUseCase,
    CreateReReadingUseCase,
    DeleteReReadingUseCase,
    {
      provide: IReReadingRepository,
      useClass: ReReadingRepository,
    },
    {
      provide: IBookRepository,
      useClass: BookRepository,
    },
  ],
})
export class ReReadingModule {}
