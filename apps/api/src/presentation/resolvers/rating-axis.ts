import { UseGuards } from '@nestjs/common';
import { Query, Mutation, Resolver, Args } from '@nestjs/graphql';
import { GetRatingAxesUseCase } from '../../application/usecases/rating-axes/get-rating-axes';
import { CreateRatingAxisUseCase } from '../../application/usecases/rating-axes/create-rating-axis';
import { DeleteRatingAxisUseCase } from '../../application/usecases/rating-axes/delete-rating-axis';
import { GetBookRatingsUseCase } from '../../application/usecases/rating-axes/get-book-ratings';
import { SetBookRatingUseCase } from '../../application/usecases/rating-axes/set-book-rating';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { GqlAuthGuard } from '../../infrastructure/auth/gql-auth.guard';
import {
  RatingAxisResponse,
  BookRatingResponse,
  CreateRatingAxisInput,
  DeleteRatingAxisInput,
  GetBookRatingsInput,
  SetBookRatingInput,
} from '../dto/rating-axis';

@Resolver()
@UseGuards(GqlAuthGuard)
export class RatingAxisResolver {
  constructor(
    private readonly getRatingAxesUseCase: GetRatingAxesUseCase,
    private readonly createRatingAxisUseCase: CreateRatingAxisUseCase,
    private readonly deleteRatingAxisUseCase: DeleteRatingAxisUseCase,
    private readonly getBookRatingsUseCase: GetBookRatingsUseCase,
    private readonly setBookRatingUseCase: SetBookRatingUseCase,
  ) {}

  @Query(() => [RatingAxisResponse])
  async ratingAxes(
    @CurrentUser() user: { id: string },
  ): Promise<RatingAxisResponse[]> {
    const axes = await this.getRatingAxesUseCase.execute(user.id);
    return axes.map((axis) => ({
      id: axis.id ?? '',
      name: axis.name,
      order: axis.order,
    }));
  }

  @Query(() => [BookRatingResponse])
  async bookRatings(
    @CurrentUser() user: { id: string },
    @Args('input') input: GetBookRatingsInput,
  ): Promise<BookRatingResponse[]> {
    return await this.getBookRatingsUseCase.execute(input.bookId, user.id);
  }

  @Mutation(() => RatingAxisResponse)
  async createRatingAxis(
    @CurrentUser() user: { id: string },
    @Args('input') input: CreateRatingAxisInput,
  ): Promise<RatingAxisResponse> {
    const axis = await this.createRatingAxisUseCase.execute({
      userId: user.id,
      name: input.name,
    });
    return { id: axis.id ?? '', name: axis.name, order: axis.order };
  }

  @Mutation(() => Boolean)
  async deleteRatingAxis(
    @CurrentUser() user: { id: string },
    @Args('input') input: DeleteRatingAxisInput,
  ): Promise<boolean> {
    await this.deleteRatingAxisUseCase.execute(input.id, user.id);
    return true;
  }

  @Mutation(() => Boolean)
  async setBookRating(
    @CurrentUser() user: { id: string },
    @Args('input') input: SetBookRatingInput,
  ): Promise<boolean> {
    await this.setBookRatingUseCase.execute({
      userId: user.id,
      bookId: input.bookId,
      axisId: input.axisId,
      value: input.value ?? null,
    });
    return true;
  }
}
