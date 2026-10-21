import { ICollectionRepository } from '../../../domain/repositories/collection';
import { Injectable, NotFoundException, Optional } from '@nestjs/common';
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
    @Optional() private readonly collectionRepository?: ICollectionRepository,
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

    const targetBooks = this.collectionRepository
      ? (
          await this.collectionRepository.items(userId, {
            collectionId: sheetId,
            itemTypeId: 'book',
          })
        ).flatMap((item) =>
          item.logs
            .filter(
              (log) =>
                log.kind === 'read' &&
                log.occurredAt &&
                months.includes(log.occurredAt.getUTCMonth() + 1) &&
                categories.includes(item.category),
            )
            .map((log) => ({
              category: item.category,
              memo: [item.memo, log.memo]
                .filter(Boolean)
                .join('\n')
                .replace(/\*.*\*/g, '***'),
              finished: log.occurredAt,
            })),
        )
      : (await this.bookRepository.findByUserIdAndSheetId(userId, sheetId))
          .filter(
            (book) =>
              book.finished &&
              months.includes(book.finished.getMonth() + 1) &&
              categories.includes(book.category),
          )
          .map((book) => ({
            category: book.category,
            memo: book.memo.replace(/\*.*\*/g, '***'),
            finished: book.finished,
          }));

    const prompt = `${aiSummaryPrompt}\n${JSON.stringify(targetBooks)}`;

    let text = '';
    let token = 0;
    // 生成はユーザー自身が接続したChatGPTアカウントで行う
    for await (const chunk of this.aiChatGateway.streamJsonCompletion(
      userId,
      prompt,
    )) {
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
        _analysisKind: 'reading',
        _criteria: {
          collectionId: sheetId,
          itemTypeId: 'book',
          logKind: 'read',
          months,
          categories,
        },
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
