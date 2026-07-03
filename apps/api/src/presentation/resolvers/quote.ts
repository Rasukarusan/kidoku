import { UseGuards } from '@nestjs/common';
import { Query, Mutation, Resolver, Args } from '@nestjs/graphql';
import { GetBookQuotesUseCase } from '../../application/usecases/quotes/get-book-quotes';
import { GetMyQuotesUseCase } from '../../application/usecases/quotes/get-my-quotes';
import { CreateQuoteUseCase } from '../../application/usecases/quotes/create-quote';
import { UpdateQuoteUseCase } from '../../application/usecases/quotes/update-quote';
import { DeleteQuoteUseCase } from '../../application/usecases/quotes/delete-quote';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { GqlAuthGuard } from '../../infrastructure/auth/gql-auth.guard';
import { Quote } from '../../domain/models/quote';
import {
  QuoteResponse,
  MyQuoteResponse,
  GetBookQuotesInput,
  CreateQuoteInput,
  UpdateQuoteInput,
  DeleteQuoteInput,
} from '../dto/quote';

@Resolver()
@UseGuards(GqlAuthGuard)
export class QuoteResolver {
  constructor(
    private readonly getBookQuotesUseCase: GetBookQuotesUseCase,
    private readonly getMyQuotesUseCase: GetMyQuotesUseCase,
    private readonly createQuoteUseCase: CreateQuoteUseCase,
    private readonly updateQuoteUseCase: UpdateQuoteUseCase,
    private readonly deleteQuoteUseCase: DeleteQuoteUseCase,
  ) {}

  @Query(() => [QuoteResponse])
  async bookQuotes(
    @CurrentUser() user: { id: string },
    @Args('input') input: GetBookQuotesInput,
  ): Promise<QuoteResponse[]> {
    const items = await this.getBookQuotesUseCase.execute(
      input.bookId,
      user.id,
    );
    return items.map((item) => this.toResponse(item));
  }

  @Query(() => [MyQuoteResponse])
  async myQuotes(
    @CurrentUser() user: { id: string },
  ): Promise<MyQuoteResponse[]> {
    const items = await this.getMyQuotesUseCase.execute(user.id);
    return items.map((item) => ({
      id: item.id.toString(),
      bookId: item.bookId,
      page: item.page,
      text: item.text,
      comment: item.comment,
      created: item.created,
      bookTitle: item.bookTitle,
      bookAuthor: item.bookAuthor,
      bookImage: item.bookImage,
    }));
  }

  @Mutation(() => QuoteResponse)
  async createQuote(
    @CurrentUser() user: { id: string },
    @Args('input') input: CreateQuoteInput,
  ): Promise<QuoteResponse> {
    const quote = await this.createQuoteUseCase.execute({
      userId: user.id,
      bookId: input.bookId,
      page: input.page ?? null,
      text: input.text,
      comment: input.comment ?? null,
    });
    return this.toResponse(quote);
  }

  @Mutation(() => QuoteResponse)
  async updateQuote(
    @CurrentUser() user: { id: string },
    @Args('input') input: UpdateQuoteInput,
  ): Promise<QuoteResponse> {
    const quote = await this.updateQuoteUseCase.execute({
      id: input.id,
      userId: user.id,
      page: input.page ?? null,
      text: input.text,
      comment: input.comment ?? null,
    });
    return this.toResponse(quote);
  }

  @Mutation(() => Boolean)
  async deleteQuote(
    @CurrentUser() user: { id: string },
    @Args('input') input: DeleteQuoteInput,
  ): Promise<boolean> {
    await this.deleteQuoteUseCase.execute(input.id, user.id);
    return true;
  }

  private toResponse(item: Quote): QuoteResponse {
    return {
      id: item.id ?? '',
      bookId: item.bookId,
      page: item.page,
      text: item.text,
      comment: item.comment,
      created: item.created,
    };
  }
}
