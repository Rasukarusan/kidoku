import { Module } from '@nestjs/common';
import { RatingAxisResolver } from '../resolvers/rating-axis';
import { GetRatingAxesUseCase } from '../../application/usecases/rating-axes/get-rating-axes';
import { CreateRatingAxisUseCase } from '../../application/usecases/rating-axes/create-rating-axis';
import { DeleteRatingAxisUseCase } from '../../application/usecases/rating-axes/delete-rating-axis';
import { GetBookRatingsUseCase } from '../../application/usecases/rating-axes/get-book-ratings';
import { SetBookRatingUseCase } from '../../application/usecases/rating-axes/set-book-rating';
import { RatingAxisRepository } from '../../infrastructure/repositories/rating-axis';
import { BookRepository } from '../../infrastructure/repositories/book';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { IRatingAxisRepository } from '../../domain/repositories/rating-axis';
import { IBookRepository } from '../../domain/repositories/book';

@Module({
  imports: [AuthModule],
  providers: [
    RatingAxisResolver,
    GetRatingAxesUseCase,
    CreateRatingAxisUseCase,
    DeleteRatingAxisUseCase,
    GetBookRatingsUseCase,
    SetBookRatingUseCase,
    {
      provide: IRatingAxisRepository,
      useClass: RatingAxisRepository,
    },
    {
      provide: IBookRepository,
      useClass: BookRepository,
    },
  ],
})
export class RatingAxisModule {}
