/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Query, Resolver } from '@nestjs/graphql';
import { CommentResponse, CommentItem } from '../dto/comment.response';
import { GetPublicCommentsUseCase } from '../../application/usecases/comments/get-public-comments';
import { Comment } from '../../domain/models/comment';

@Resolver()
export class CommentResolver {
  constructor(
    private readonly getPublicCommentsUseCase: GetPublicCommentsUseCase,
  ) {}

  @Query(() => CommentResponse)
  async comments(): Promise<CommentResponse> {
    const result = await this.getPublicCommentsUseCase.execute();
    return {
      comments: result.items.map((item) => this.toCommentItem(item)),
      total: result.total,
      hasMore: result.hasMore,
    };
  }

  private toCommentItem(comment: Comment): CommentItem {
    return {
      id: comment.bookId,
      title: comment.bookTitle,
      memo: comment.bookMemo,
      image: comment.bookImage,
      updated: comment.bookUpdated,
      username: comment.username,
      userImage: comment.userImage ?? undefined,
      sheet: comment.sheetId,
    };
  }
}
