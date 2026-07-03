import { AuthorFollow } from '../models/author-follow';

export abstract class IAuthorFollowRepository {
  abstract findByUserId(userId: string): Promise<AuthorFollow[]>;
  abstract findByUserIdAndName(
    userId: string,
    authorName: string,
  ): Promise<AuthorFollow | null>;
  abstract save(authorFollow: AuthorFollow): Promise<AuthorFollow>;
  abstract delete(id: number, userId: string): Promise<void>;
}
