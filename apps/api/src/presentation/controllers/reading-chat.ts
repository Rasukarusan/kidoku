import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AskReadingChatUseCase } from '../../application/usecases/reading-chat/ask-reading-chat';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { HttpAuthGuard } from '../../infrastructure/auth/http-auth.guard';

class AskReadingChatDto {
  question: string;
}

@Controller('reading-chat')
@UseGuards(HttpAuthGuard)
export class ReadingChatController {
  constructor(private readonly askReadingChat: AskReadingChatUseCase) {}

  @Post()
  async ask(
    @CurrentUser() user: { id: string },
    @Body() body: AskReadingChatDto,
  ): Promise<{ answer: string }> {
    return {
      answer: await this.askReadingChat.execute(user.id, body.question),
    };
  }
}
