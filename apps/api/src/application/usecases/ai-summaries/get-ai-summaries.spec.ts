import { GetAiSummariesUseCase } from './get-ai-summaries';
import { AiSummary } from '../../../domain/models/ai-summary';
import { Sheet } from '../../../domain/models/sheet';
import { IAiSummaryRepository } from '../../../domain/repositories/ai-summary';
import { ISheetRepository } from '../../../domain/repositories/sheet';

describe('GetAiSummariesUseCase', () => {
  let useCase: GetAiSummariesUseCase;
  let mockAiSummaryRepo: jest.Mocked<IAiSummaryRepository>;
  let mockSheetRepo: jest.Mocked<ISheetRepository>;

  beforeEach(() => {
    mockAiSummaryRepo = {
      findByUserIdAndSheetId: jest.fn(),
      countByUserIdAndMonth: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IAiSummaryRepository>;

    mockSheetRepo = {
      findByUserIdAndName: jest.fn(),
    } as unknown as jest.Mocked<ISheetRepository>;

    useCase = new GetAiSummariesUseCase(mockAiSummaryRepo, mockSheetRepo);
  });

  it('シート名からAIサマリー一覧を取得できる', async () => {
    mockSheetRepo.findByUserIdAndName.mockResolvedValue({
      id: '10',
    } as unknown as Sheet);
    const summaries = [
      AiSummary.fromDatabase(
        '1',
        'user-1',
        10,
        { overall_feedback: 'test' },
        100,
        new Date(),
        new Date(),
      ),
    ];
    mockAiSummaryRepo.findByUserIdAndSheetId.mockResolvedValue(summaries);

    const result = await useCase.execute('user-1', '2024');

    expect(result).toEqual(summaries);
    expect(mockSheetRepo.findByUserIdAndName).toHaveBeenCalledWith(
      'user-1',
      '2024',
    );
    expect(mockAiSummaryRepo.findByUserIdAndSheetId).toHaveBeenCalledWith(
      'user-1',
      10,
    );
  });

  it('シートが存在しない場合は空配列を返す', async () => {
    mockSheetRepo.findByUserIdAndName.mockResolvedValue(null);

    const result = await useCase.execute('user-1', 'unknown');

    expect(result).toEqual([]);
    expect(mockAiSummaryRepo.findByUserIdAndSheetId).not.toHaveBeenCalled();
  });
});
