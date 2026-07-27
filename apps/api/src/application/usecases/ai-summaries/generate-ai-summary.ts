import { Injectable, NotFoundException } from '@nestjs/common';
import { IAiChatGateway } from '../../../domain/gateways/ai-chat';
import { IAiSummaryRepository } from '../../../domain/repositories/ai-summary';
import { IBookRepository } from '../../../domain/repositories/book';
import { ISheetRepository } from '../../../domain/repositories/sheet';
import { aiSummaryPrompt } from '../../../shared/ai/prompt';
import { PERSONALITY_TYPE_IDS } from '../../../shared/ai/personality-types';

const ANALYSIS_SCHEMA_VERSION = 3;

/**
 * 読了本の感想からAI読書分析を生成し、DBに保存する。
 * 生成テキストの増分をAsyncGeneratorとしてストリーミング返却する。
 */
@Injectable()
export class GenerateAiSummaryUseCase {
  constructor(
    private readonly aiSummaryRepository: IAiSummaryRepository,
    private readonly sheetRepository: ISheetRepository,
    private readonly bookRepository: IBookRepository,
    private readonly aiChatGateway: IAiChatGateway,
  ) {}

  async *execute(
    userId: string,
    sheetName: string,
    months: number[],
    categories: string[],
  ): AsyncGenerator<string> {
    const sheet = await this.sheetRepository.findByUserIdAndName(
      userId,
      sheetName,
    );
    if (!sheet || !sheet.id) {
      throw new NotFoundException('Sheet not found');
    }
    const sheetId = parseInt(sheet.id, 10);

    const books = await this.bookRepository.findByUserIdAndSheetId(
      userId,
      sheetId,
    );
    const targetBooks = books
      .filter((book) => {
        if (!book.finished) return false;
        const month = new Date(book.finished).getMonth() + 1;
        return months.includes(month) && categories.includes(book.category);
      })
      .map((book) => ({
        category: book.category,
        // 非公開部分（*で囲まれた箇所）はマスクして渡す
        memo: book.memo.replace(/\*.*\*/g, '***'),
        finished: book.finished,
      }));

    const prompt = `${aiSummaryPrompt}\n${JSON.stringify(targetBooks)}`;

    let text = '';
    let token = 0;
    for await (const chunk of this.aiChatGateway.streamJsonCompletion(prompt)) {
      if (chunk.delta) {
        text += chunk.delta;
        yield chunk.delta;
      }
      if (chunk.totalTokens) {
        token = chunk.totalTokens;
      }
    }

    const json = JSON.parse(text) as Record<string, unknown>;
    const {
      personality_type,
      character_summary,
      reading_trend_analysis,
      sentiment_analysis,
      hidden_theme_discovery,
      overall_feedback,
    } = json;

    await this.aiSummaryRepository.create(
      userId,
      sheetId,
      {
        _schemaVersion: ANALYSIS_SCHEMA_VERSION,
        // 定義外のタイプIDが返ってきた場合は未診断扱いにする
        personality_type: PERSONALITY_TYPE_IDS.includes(
          personality_type as string,
        )
          ? personality_type
          : '',
        character_summary,
        reading_trend_analysis,
        sentiment_analysis,
        hidden_theme_discovery,
        overall_feedback,
      },
      token,
    );
  }
}
