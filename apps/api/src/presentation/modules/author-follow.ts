import { Module } from '@nestjs/common';
import { AuthorFollowResolver } from '../resolvers/author-follow';
import { GetFollowedAuthorsUseCase } from '../../application/usecases/author-follows/get-followed-authors';
import { FollowAuthorUseCase } from '../../application/usecases/author-follows/follow-author';
import { UnfollowAuthorUseCase } from '../../application/usecases/author-follows/unfollow-author';
import { GetAuthorNewReleasesUseCase } from '../../application/usecases/author-follows/get-author-new-releases';
import { AuthorFollowRepository } from '../../infrastructure/repositories/author-follow';
import { RakutenBooksRepository } from '../../infrastructure/repositories/rakuten-books';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { IAuthorFollowRepository } from '../../domain/repositories/author-follow';
import { IBookSearchRepository } from '../../domain/repositories/book-search';

@Module({
  imports: [AuthModule],
  providers: [
    AuthorFollowResolver,
    GetFollowedAuthorsUseCase,
    FollowAuthorUseCase,
    UnfollowAuthorUseCase,
    GetAuthorNewReleasesUseCase,
    {
      provide: IAuthorFollowRepository,
      useClass: AuthorFollowRepository,
    },
    {
      provide: IBookSearchRepository,
      useClass: RakutenBooksRepository,
    },
  ],
})
export class AuthorFollowModule {}
