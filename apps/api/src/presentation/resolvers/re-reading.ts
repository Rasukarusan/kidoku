import { UseGuards } from '@nestjs/common';
import { Query, Mutation, Resolver, Args } from '@nestjs/graphql';
import { GetBookReReadingsUseCase } from '../../application/usecases/re-readings/get-book-re-readings';
import { CreateReReadingUseCase } from '../../application/usecases/re-readings/create-re-reading';
import { DeleteReReadingUseCase } from '../../application/usecases/re-readings/delete-re-reading';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { GqlAuthGuard } from '../../infrastructure/auth/gql-auth.guard';
import { ReReading } from '../../domain/models/re-reading';
import {
  ReReadingResponse,
  GetBookReReadingsInput,
  CreateReReadingInput,
  DeleteReReadingInput,
} from '../dto/re-reading';

@Resolver()
@UseGuards(GqlAuthGuard)
export class ReReadingResolver {
  constructor(
    private readonly getBookReReadingsUseCase: GetBookReReadingsUseCase,
    private readonly createReReadingUseCase: CreateReReadingUseCase,
    private readonly deleteReReadingUseCase: DeleteReReadingUseCase,
  ) {}

  @Query(() => [ReReadingResponse])
  async bookReReadings(
    @CurrentUser() user: { id: string },
    @Args('input') input: GetBookReReadingsInput,
  ): Promise<ReReadingResponse[]> {
    const items = await this.getBookReReadingsUseCase.execute(
      input.bookId,
      user.id,
    );
    return items.map((item) => this.toResponse(item));
  }

  @Mutation(() => ReReadingResponse)
  async createReReading(
    @CurrentUser() user: { id: string },
    @Args('input') input: CreateReReadingInput,
  ): Promise<ReReadingResponse> {
    const reReading = await this.createReReadingUseCase.execute({
      userId: user.id,
      bookId: input.bookId,
      finished: input.finished,
      memo: input.memo ?? null,
    });
    return this.toResponse(reReading);
  }

  @Mutation(() => Boolean)
  async deleteReReading(
    @CurrentUser() user: { id: string },
    @Args('input') input: DeleteReReadingInput,
  ): Promise<boolean> {
    await this.deleteReReadingUseCase.execute(input.id, user.id);
    return true;
  }

  private toResponse(item: ReReading): ReReadingResponse {
    return {
      id: item.id ?? '',
      bookId: item.bookId,
      finished: item.finished,
      memo: item.memo,
      created: item.created,
    };
  }
}
