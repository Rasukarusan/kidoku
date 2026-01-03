import { Comment } from '../models/comment';
import { PaginatedResult } from '../types/paginated-result';

export abstract class ICommentRepository {
  abstract findPublicComments(
    limit: number,
    offset: number,
  ): Promise<PaginatedResult<Comment>>;
}
