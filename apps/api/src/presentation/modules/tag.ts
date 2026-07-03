import { Module } from '@nestjs/common';
import { TagResolver } from '../resolvers/tag';
import { GetMyTagsUseCase } from '../../application/usecases/tags/get-my-tags';
import { GetBookTagsUseCase } from '../../application/usecases/tags/get-book-tags';
import { GetBooksByTagUseCase } from '../../application/usecases/tags/get-books-by-tag';
import { SetBookTagsUseCase } from '../../application/usecases/tags/set-book-tags';
import { TagRepository } from '../../infrastructure/repositories/tag';
import { BookRepository } from '../../infrastructure/repositories/book';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { ITagRepository } from '../../domain/repositories/tag';
import { IBookRepository } from '../../domain/repositories/book';

@Module({
  imports: [AuthModule],
  providers: [
    TagResolver,
    GetMyTagsUseCase,
    GetBookTagsUseCase,
    GetBooksByTagUseCase,
    SetBookTagsUseCase,
    {
      provide: ITagRepository,
      useClass: TagRepository,
    },
    {
      provide: IBookRepository,
      useClass: BookRepository,
    },
  ],
})
export class TagModule {}
