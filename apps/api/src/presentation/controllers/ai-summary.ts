import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { GenerateAiSummaryUseCase } from '../../application/usecases/ai-summaries/generate-ai-summary';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { HttpAuthGuard } from '../../infrastructure/auth/http-auth.guard';
import { GenerateAiSummaryDto } from '../dto/ai-summary';

/** 生成失敗をストリーム本文で伝えるためのマーカー */
export const AI_SUMMARY_ERROR_PREFIX = 'ERROR:';

/** 利用者に見せる生成失敗の案内 */
export const AI_SUMMARY_ERROR_MESSAGE =
  'AI分析の生成に失敗しました。時間をおいて再度お試しください。';

/**
 * AI読書分析の生成エンドポイント。
 * 生成テキストをストリーミング返却するためGraphQLではなくRESTで提供する。
 * フロントエンドからはNext.jsの署名付きプロキシ(/api/ai-summary)経由で呼び出される。
 */
@Controller('ai-summary')
@UseGuards(HttpAuthGuard)
export class AiSummaryController {
  constructor(
    private readonly generateAiSummaryUseCase: GenerateAiSummaryUseCase,
  ) {}

  @Post('generate')
  async generate(
    @CurrentUser() user: { id: string },
    @Body() body: GenerateAiSummaryDto,
    @Res() res: Response,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    try {
      const stream = this.generateAiSummaryUseCase.execute(
        user.id,
        body.sheetName,
        body.months,
        body.categories,
      );
      for await (const delta of stream) {
        res.write(delta);
      }
      res.write('COMPLETE');
    } catch (e) {
      console.error('AI summary generation failed:', e);
      // ヘッダー送出後はステータスコードを変えられないため、本文にエラーを載せて中継する。
      // 原因(LLMバックエンドの応答など)はログのみに残し、利用者には固定の案内を返す。
      res.write(`${AI_SUMMARY_ERROR_PREFIX}${AI_SUMMARY_ERROR_MESSAGE}`);
    } finally {
      res.end();
    }
  }
}
