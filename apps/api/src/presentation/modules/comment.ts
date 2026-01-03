import { Module } from '@nestjs/common';
import { CommentResolver } from '../resolvers/comment';
import { CommentRepository } from '../../infrastructure/repositories/comment';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { ICommentRepository } from 'src/domain/repositories/comment';
import { GetPublicCommentsUseCase } from 'src/application/usecases/comments/get-public-comments';

@Module({
  imports: [AuthModule, DatabaseModule],
  providers: [
    CommentResolver,
    GetPublicCommentsUseCase,
    {
      provide: ICommentRepository,
      useClass: CommentRepository,
    },
  ],
})
export class CommentModule {}
