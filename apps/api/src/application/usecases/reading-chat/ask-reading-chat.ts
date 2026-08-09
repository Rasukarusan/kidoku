import { BadRequestException, Injectable } from '@nestjs/common';
import { IAiChatGateway } from '../../../domain/gateways/ai-chat';
import { IBookRepository } from '../../../domain/repositories/book';

const MAX_QUESTION_LENGTH = 500;
const MAX_BOOKS = 200;

@Injectable()
export class AskReadingChatUseCase {
  constructor(
    private readonly bookRepository: IBookRepository,
    private readonly aiChatGateway: IAiChatGateway,
  ) {}

  async execute(userId: string, question: string): Promise<string> {
    const normalizedQuestion = question.trim();
    if (
      !normalizedQuestion ||
      normalizedQuestion.length > MAX_QUESTION_LENGTH
    ) {
      throw new BadRequestException('質問は1〜500文字で入力してください');
    }

    const books = (await this.bookRepository.findByUserId(userId))
      .slice(0, MAX_BOOKS)
      .map((book) => ({
        title: book.title,
        author: book.author,
        category: book.category,
        impression: book.impression,
        finished: book.finished,
        // *...* は利用者が非公開にした箇所なのでLLMへ渡さない
        memo: book.memo.replace(/\*.*?\*/g, '***').slice(0, 1200),
      }));

    const prompt = `あなたは読書記録アプリKidokuのアシスタントです。以下は利用者本人の読書記録です。記録に基づいて日本語で簡潔かつ親しみやすく答えてください。記録にない事実は推測せず、その旨を伝えてください。返答は {"answer":"返答本文"} のJSONだけにしてください。\n\n質問: ${normalizedQuestion}\n\n読書記録: ${JSON.stringify(books)}`;

    let text = '';
    for await (const chunk of this.aiChatGateway.streamJsonCompletion(
      userId,
      prompt,
    )) {
      if (chunk.delta) text += chunk.delta;
    }

    const result = JSON.parse(text) as { answer?: unknown };
    if (typeof result.answer !== 'string' || !result.answer.trim()) {
      throw new Error('Reading chat returned an invalid response');
    }
    return result.answer.trim();
  }
}
