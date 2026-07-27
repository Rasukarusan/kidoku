import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { GenerateAiSummaryUseCase } from '../../application/usecases/ai-summaries/generate-ai-summary';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { HttpAuthGuard } from '../../infrastructure/auth/http-auth.guard';
import { GenerateAiSummaryDto } from '../dto/ai-summary';

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
      res.write(JSON.stringify({ result: false }));
    } finally {
      res.end();
    }
  }
}
