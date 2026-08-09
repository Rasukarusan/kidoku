import { Module } from '@nestjs/common';
import { AskReadingChatUseCase } from '../../application/usecases/reading-chat/ask-reading-chat';
import { IBookRepository } from '../../domain/repositories/book';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { BookRepository } from '../../infrastructure/repositories/book';
import { ReadingChatController } from '../controllers/reading-chat';
import { CodexModule } from './codex';

@Module({
  imports: [AuthModule, CodexModule],
  controllers: [ReadingChatController],
  providers: [
    AskReadingChatUseCase,
    { provide: IBookRepository, useClass: BookRepository },
  ],
})
export class ReadingChatModule {}
