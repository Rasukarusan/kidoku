import { SaveAiSummaryUseCase } from './save-ai-summary';
import { IAiSummaryRepository } from '../../../domain/repositories/ai-summary';
import { ISheetRepository } from '../../../domain/repositories/sheet';
import { Sheet } from '../../../domain/models/sheet';

describe('SaveAiSummaryUseCase', () => {
  let useCase: SaveAiSummaryUseCase;
  let mockAiSummaryRepo: jest.Mocked<IAiSummaryRepository>;
  let mockSheetRepo: jest.Mocked<ISheetRepository>;

  beforeEach(() => {
    mockAiSummaryRepo = {
      countByUserIdAndMonth: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IAiSummaryRepository>;

    mockSheetRepo = {
      findByUserId: jest.fn(),
      findById: jest.fn(),
      findLastByUserId: jest.fn(),
      findByUserIdAndName: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      saveAll: jest.fn(),
    } as unknown as jest.Mocked<ISheetRepository>;

    useCase = new SaveAiSummaryUseCase(mockAiSummaryRepo, mockSheetRepo);
  });

  const validAnalysis = {
    character_summary: 'サマリー',
    reading_trend_analysis: 'トレンド分析',
    sentiment_analysis: '感情分析',
    hidden_theme_discovery: '隠れたテーマ',
    overall_feedback: '総合フィードバック',
  };

  it('有効な分析データを保存できる', async () => {
    const sheet = Sheet.fromDatabase(
      '1',
      'user-1',
      '2025',
      1,
      new Date(),
      new Date(),
    );
    mockSheetRepo.findByUserIdAndName.mockResolvedValue(sheet);
    mockAiSummaryRepo.create.mockResolvedValue(undefined);

    await useCase.execute('user-1', '2025', validAnalysis);

    expect(mockSheetRepo.findByUserIdAndName).toHaveBeenCalledWith(
      'user-1',
      '2025',
    );
    expect(mockAiSummaryRepo.create).toHaveBeenCalledWith(
      'user-1',
      1,
      { _schemaVersion: 2, ...validAnalysis },
      0,
    );
  });

  it('必須キーが不足している場合エラーになる', async () => {
    const invalidAnalysis = {
      character_summary: 'サマリー',
      reading_trend_analysis: 'トレンド分析',
    };

    await expect(
      useCase.execute('user-1', '2025', invalidAnalysis),
    ).rejects.toThrow('Invalid analysis format');
  });

  it('シートが見つからない場合エラーになる', async () => {
    mockSheetRepo.findByUserIdAndName.mockResolvedValue(null);

    await expect(
      useCase.execute('user-1', '存在しないシート', validAnalysis),
    ).rejects.toThrow('Sheet not found');
  });

  it('シートIDがnullの場合エラーになる', async () => {
    const sheetWithoutId = Sheet.create('user-1', '2025', 1);
    mockSheetRepo.findByUserIdAndName.mockResolvedValue(sheetWithoutId);

    await expect(
      useCase.execute('user-1', '2025', validAnalysis),
    ).rejects.toThrow('Sheet not found');
  });
});
