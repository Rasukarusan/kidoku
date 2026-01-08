import { UseGuards } from '@nestjs/common';
import { Query, Mutation, Resolver, Args } from '@nestjs/graphql';
import { CreateBookUseCase } from '../../application/usecases/books/create-book';
import { UpdateBookUseCase } from '../../application/usecases/books/update-book';
import { DeleteBookUseCase } from '../../application/usecases/books/delete-book';
import { GetBookUseCase } from '../../application/usecases/books/get-book';
import { GetBooksUseCase } from '../../application/usecases/books/get-books';
import { GetBookCategoriesUseCase } from '../../application/usecases/books/get-book-categories';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { GqlAuthGuard } from '../../infrastructure/auth/gql-auth.guard';
import { Book } from '../../domain/models/book';
import {
  BookResponse,
  CreateBookInput,
  UpdateBookInput,
  DeleteBookInput,
  GetBooksInput,
  GetBookInput,
} from '../dto/book';

@Resolver()
@UseGuards(GqlAuthGuard)
export class BookResolver {
  constructor(
    private readonly createBookUseCase: CreateBookUseCase,
    private readonly updateBookUseCase: UpdateBookUseCase,
    private readonly deleteBookUseCase: DeleteBookUseCase,
    private readonly getBookUseCase: GetBookUseCase,
    private readonly getBooksUseCase: GetBooksUseCase,
    private readonly getBookCategoriesUseCase: GetBookCategoriesUseCase,
  ) {}

  @Query(() => BookResponse, { nullable: true })
  async book(
    @CurrentUser() user: { id: string },
    @Args('input') input: GetBookInput,
  ): Promise<BookResponse | null> {
    const book = await this.getBookUseCase.execute(input.id);
    if (!book) return null;

    const isOwner = book.userId === user.id;
    return this.toResponse(book, isOwner);
  }

  @Query(() => [BookResponse])
  async books(
    @CurrentUser() user: { id: string },
    @Args('input', { nullable: true }) input?: GetBooksInput,
  ): Promise<BookResponse[]> {
    const books = await this.getBooksUseCase.execute({
      userId: input?.userId,
      sheetId: input?.sheetId,
    });

    return books.map((book) => {
      const isOwner = book.userId === user.id;
      return this.toResponse(book, isOwner);
    });
  }

  @Query(() => [String])
  async bookCategories(@CurrentUser() user: { id: string }): Promise<string[]> {
    return await this.getBookCategoriesUseCase.execute(user.id);
  }

  @Mutation(() => BookResponse)
  async createBook(
    @CurrentUser() user: { id: string },
    @Args('input') input: CreateBookInput,
  ): Promise<BookResponse> {
    const book = await this.createBookUseCase.execute({
      userId: user.id,
      sheetId: input.sheetId,
      title: input.title,
      author: input.author,
      category: input.category,
      image: input.image,
      impression: input.impression,
      memo: input.memo,
      isPublicMemo: input.isPublicMemo,
      isPurchasable: input.isPurchasable,
      finished: input.finished || null,
    });

    return this.toResponse(book, true);
  }

  @Mutation(() => BookResponse)
  async updateBook(
    @CurrentUser() user: { id: string },
    @Args('input') input: UpdateBookInput,
  ): Promise<BookResponse> {
    const book = await this.updateBookUseCase.execute(user.id, input.id, {
      title: input.title,
      author: input.author,
      category: input.category,
      image: input.image,
      impression: input.impression,
      memo: input.memo,
      isPublicMemo: input.isPublicMemo,
      isPurchasable: input.isPurchasable,
      finished: input.finished,
      sheetId: input.sheetId,
    });

    return this.toResponse(book, true);
  }

  @Mutation(() => Boolean)
  async deleteBook(
    @CurrentUser() user: { id: string },
    @Args('input') input: DeleteBookInput,
  ): Promise<boolean> {
    await this.deleteBookUseCase.execute(user.id, input.id);
    return true;
  }

  private toResponse(book: Book, isOwner: boolean): BookResponse {
    return {
      id: book.id ?? '',
      userId: book.userId,
      sheetId: book.sheetId,
      title: book.title,
      author: book.author,
      category: book.category,
      image: book.image,
      impression: book.impression,
      memo: book.getSanitizedMemo(isOwner) ?? undefined,
      isPublicMemo: book.isPublicMemo,
      isPurchasable: book.isPurchasable,
      finished: book.finished ?? undefined,
      created: book.created,
      updated: book.updated,
    };
  }
}
