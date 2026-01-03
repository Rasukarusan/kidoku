import { Comment } from 'src/domain/models/comment';
import { PaginatedResult } from '../types/paginated-result';

export abstract class ICommentRepository {
  abstract findPublicComments(): Promise<PaginatedResult<Comment>>;
}
