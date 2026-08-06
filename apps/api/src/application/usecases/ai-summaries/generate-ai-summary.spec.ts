import { NotFoundException } from '@nestjs/common';
import { GenerateAiSummaryUseCase } from './generate-ai-summary';
import { Book } from '../../../domain/models/book';
import { Sheet } from '../../../domain/models/sheet';
import {
  IAiChatGateway,
  AiChatStreamChunk,
} from '../../../domain/gateways/ai-chat';
import { IAiSummaryRepository } from '../../../domain/repositories/ai-summary';
import { IBookRepository } from '../../../domain/repositories/book';
import { ISheetRepository } from '../../../domain/repositories/sheet';

const collect = async (gen: AsyncGenerator<string>): Promise<string> => {
  let text = '';
  for await (const chunk of gen) {
    text += chunk;
  }
  return text;
};

const analysisJson = {
  personality_type: 'adventurer',
  character_summary: 'summary',
  reading_trend_analysis: 'trend',
  sentiment_analysis: 'sentiment',
  hidden_theme_discovery: 'theme',
  overall_feedback: 'feedback',
};

describe('GenerateAiSummaryUseCase', () => {
  let useCase: GenerateAiSummaryUseCase;
  let mockAiSummaryRepo: jest.Mocked<IAiSummaryRepository>;
  let mockSheetRepo: jest.Mocked<ISheetRepository>;
  let mockBookRepo: jest.Mocked<IBookRepository>;
  let mockAiChatGateway: jest.Mocked<IAiChatGateway>;

  const mockStream = (chunks: AiChatStreamChunk[]) => {
    mockAiChatGateway.streamJsonCompletion.mockImplementation(
      async function* () {
        for (const chunk of chunks) {
          yield await Promise.resolve(chunk);
        }
      },
    );
  };

  beforeEach(() => {
    mockAiSummaryRepo = {
      create: jest.fn(),
    } as unknown as jest.Mocked<IAiSummaryRepository>;
    mockSheetRepo = {
      findByUserIdAndName: jest.fn(),
    } as unknown as jest.Mocked<ISheetRepository>;
    mockBookRepo = {
      findByUserIdAndSheetId: jest.fn(),
    } as unknown as jest.Mocked<IBookRepository>;
    mockAiChatGateway = {
      streamJsonCompletion: jest.fn(),
    } as unknown as jest.Mocked<IAiChatGateway>;

    useCase = new GenerateAiSummaryUseCase(
      mockAiSummaryRepo,
      mockSheetRepo,
      mockBookRepo,
      mockAiChatGateway,
    );
  });

  it('生成テキストをストリーミングし、完了後に分析結果を保存する', async () => {
    mockSheetRepo.findByUserIdAndName.mockResolvedValue({
      id: '10',
    } as unknown as Sheet);
    mockBookRepo.findByUserIdAndSheetId.mockResolvedValue([
      {
        category: '小説',
        memo: '面白かった*秘密の感想*',
        finished: new Date('2024-05-01'),
      } as unknown as Book,
    ]);
    const text = JSON.stringify(analysisJson);
    mockStream([{ delta: text }, { totalTokens: 123 }]);

    const result = await collect(
      useCase.execute('user-1', '2024', [5], ['小説']),
    );

    expect(result).toBe(text);
    expect(mockAiSummaryRepo.create).toHaveBeenCalledWith(
      'user-1',
      10,
      expect.objectContaining({
        _schemaVersion: 3,
        personality_type: 'adventurer',
        overall_feedback: 'feedback',
      }),
      123,
    );
    // 生成はユーザー自身のChatGPTアカウントで行う
    expect(mockAiChatGateway.streamJsonCompletion.mock.calls[0][0]).toBe(
      'user-1',
    );
    // 非公開部分はマスクしてプロンプトに含める
    const prompt = mockAiChatGateway.streamJsonCompletion.mock.calls[0][1];
    expect(prompt).toContain('面白かった***');
    expect(prompt).not.toContain('秘密の感想');
  });

  it('定義外の読書性格タイプは未診断として保存する', async () => {
    mockSheetRepo.findByUserIdAndName.mockResolvedValue({
      id: '10',
    } as unknown as Sheet);
    mockBookRepo.findByUserIdAndSheetId.mockResolvedValue([]);
    mockStream([
      { delta: JSON.stringify({ ...analysisJson, personality_type: 'xxx' }) },
    ]);

    await collect(useCase.execute('user-1', '2024', [5], ['小説']));

    expect(mockAiSummaryRepo.create).toHaveBeenCalledWith(
      'user-1',
      10,
      expect.objectContaining({ personality_type: '' }),
      0,
    );
  });

  it('月・カテゴリに一致しない本や未読了の本は対象から除外する', async () => {
    mockSheetRepo.findByUserIdAndName.mockResolvedValue({
      id: '10',
    } as unknown as Sheet);
    mockBookRepo.findByUserIdAndSheetId.mockResolvedValue([
      {
        category: '小説',
        memo: '対象',
        finished: new Date('2024-05-01'),
      } as unknown as Book,
      {
        category: '技術書',
        memo: 'カテゴリ不一致',
        finished: new Date('2024-05-01'),
      } as unknown as Book,
      {
        category: '小説',
        memo: '月不一致',
        finished: new Date('2024-06-01'),
      } as unknown as Book,
      {
        category: '小説',
        memo: '未読了',
        finished: null,
      } as unknown as Book,
    ]);
    mockStream([{ delta: JSON.stringify(analysisJson) }]);

    await collect(useCase.execute('user-1', '2024', [5], ['小説']));

    const prompt = mockAiChatGateway.streamJsonCompletion.mock.calls[0][1];
    expect(prompt).toContain('対象');
    expect(prompt).not.toContain('カテゴリ不一致');
    expect(prompt).not.toContain('月不一致');
    expect(prompt).not.toContain('未読了');
  });

  it('シートが存在しない場合はNotFoundExceptionを投げる', async () => {
    mockSheetRepo.findByUserIdAndName.mockResolvedValue(null);

    await expect(
      collect(useCase.execute('user-1', 'unknown', [5], ['小説'])),
    ).rejects.toThrow(NotFoundException);
    expect(mockAiSummaryRepo.create).not.toHaveBeenCalled();
  });
});
