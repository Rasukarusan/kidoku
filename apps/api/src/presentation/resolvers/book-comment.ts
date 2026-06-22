import { UseGuards } from '@nestjs/common';
import { Query, Mutation, Resolver, Args } from '@nestjs/graphql';
import { GqlAuthGuard } from '../../infrastructure/auth/gql-auth.guard';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { CreateBookCommentUseCase } from '../../application/usecases/book-comments/create-book-comment';
import { GetBookCommentsUseCase } from '../../application/usecases/book-comments/get-book-comments';
import { DeleteBookCommentUseCase } from '../../application/usecases/book-comments/delete-book-comment';
import {
  BookCommentItem,
  BookCommentsResponse,
  CreateBookCommentInput,
  DeleteBookCommentInput,
  GetBookCommentsInput,
} from '../dto/book-comment';
import { BookComment } from '../../domain/models/book-comment';

@Resolver()
export class BookCommentResolver {
  constructor(
    private readonly createBookCommentUseCase: CreateBookCommentUseCase,
    private readonly getBookCommentsUseCase: GetBookCommentsUseCase,
    private readonly deleteBookCommentUseCase: DeleteBookCommentUseCase,
  ) {}

  @Query(() => BookCommentsResponse)
  async bookComments(
    @Args('input') input: GetBookCommentsInput,
  ): Promise<BookCommentsResponse> {
    const result = await this.getBookCommentsUseCase.execute(
      input.bookId,
      input.limit,
      input.offset,
    );
    return {
      comments: result.items.map((item) => this.toItem(item)),
      total: result.total,
      hasMore: result.hasMore,
    };
  }

  @Mutation(() => BookCommentItem)
  @UseGuards(GqlAuthGuard)
  async createBookComment(
    @CurrentUser() user: { id: string },
    @Args('input') input: CreateBookCommentInput,
  ): Promise<BookCommentItem> {
    const comment = await this.createBookCommentUseCase.execute(
      user.id,
      input.bookId,
      input.content,
    );
    return this.toItem(comment);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteBookComment(
    @CurrentUser() user: { id: string },
    @Args('input') input: DeleteBookCommentInput,
  ): Promise<boolean> {
    return this.deleteBookCommentUseCase.execute(user.id, input.id);
  }

  private toItem(comment: BookComment): BookCommentItem {
    return {
      id: String(comment.id),
      bookId: comment.bookId,
      userId: comment.userId,
      content: comment.content,
      created: comment.created,
      updated: comment.updated,
      username: comment.username,
      userImage: comment.userImage ?? undefined,
    };
  }
}
