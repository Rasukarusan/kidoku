import { Module } from '@nestjs/common';
import { CommentResolver } from '../resolvers/comment';
import { CommentRepository } from '../../infrastructure/repositories/comment';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { ICommentRepository } from '../../domain/repositories/comment';
import { GetPublicCommentsUseCase } from '../../application/usecases/comments/get-public-comments';

@Module({
  imports: [AuthModule],
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
