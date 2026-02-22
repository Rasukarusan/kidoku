import { UseGuards } from '@nestjs/common';
import { Query, Mutation, Resolver, Args } from '@nestjs/graphql';
import { GetYearlyTopBooksUseCase } from '../../application/usecases/yearly-top-books/get-yearly-top-books';
import { UpsertYearlyTopBookUseCase } from '../../application/usecases/yearly-top-books/upsert-yearly-top-book';
import { DeleteYearlyTopBookUseCase } from '../../application/usecases/yearly-top-books/delete-yearly-top-book';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { GqlAuthGuard } from '../../infrastructure/auth/gql-auth.guard';
import { YearlyTopBookWithBook } from '../../domain/repositories/yearly-top-book';
import {
  YearlyTopBookResponse,
  GetYearlyTopBooksInput,
  UpsertYearlyTopBookInput,
  DeleteYearlyTopBookInput,
} from '../dto/yearly-top-book';

@Resolver()
@UseGuards(GqlAuthGuard)
export class YearlyTopBookResolver {
  constructor(
    private readonly getYearlyTopBooksUseCase: GetYearlyTopBooksUseCase,
    private readonly upsertYearlyTopBookUseCase: UpsertYearlyTopBookUseCase,
    private readonly deleteYearlyTopBookUseCase: DeleteYearlyTopBookUseCase,
  ) {}

  @Query(() => [YearlyTopBookResponse])
  async yearlyTopBooks(
    @CurrentUser() user: { id: string },
    @Args('input') input: GetYearlyTopBooksInput,
  ): Promise<YearlyTopBookResponse[]> {
    const items = await this.getYearlyTopBooksUseCase.execute(
      user.id,
      input.year,
    );
    return items.map((item) => this.toResponse(item));
  }

  @Mutation(() => Boolean)
  async upsertYearlyTopBook(
    @CurrentUser() user: { id: string },
    @Args('input') input: UpsertYearlyTopBookInput,
  ): Promise<boolean> {
    await this.upsertYearlyTopBookUseCase.execute(
      user.id,
      input.year,
      input.order,
      input.bookId,
    );
    return true;
  }

  @Mutation(() => Boolean)
  async deleteYearlyTopBook(
    @CurrentUser() user: { id: string },
    @Args('input') input: DeleteYearlyTopBookInput,
  ): Promise<boolean> {
    await this.deleteYearlyTopBookUseCase.execute(
      user.id,
      input.year,
      input.order,
    );
    return true;
  }

  private toResponse(item: YearlyTopBookWithBook): YearlyTopBookResponse {
    return {
      year: item.year,
      order: item.order,
      book: item.book,
    };
  }
}
