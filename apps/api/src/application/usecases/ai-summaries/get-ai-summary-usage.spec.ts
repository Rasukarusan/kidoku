import { GetAiSummaryUsageUseCase } from './get-ai-summary-usage';
import { IAiSummaryRepository } from '../../../domain/repositories/ai-summary';

describe('GetAiSummaryUsageUseCase', () => {
  let useCase: GetAiSummaryUsageUseCase;
  let mockAiSummaryRepo: jest.Mocked<IAiSummaryRepository>;

  beforeEach(() => {
    mockAiSummaryRepo = {
      countByUserIdAndMonth: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IAiSummaryRepository>;

    useCase = new GetAiSummaryUsageUseCase(mockAiSummaryRepo);
  });

  it('今月の利用回数を取得できる', async () => {
    mockAiSummaryRepo.countByUserIdAndMonth.mockResolvedValue(5);

    const result = await useCase.execute('user-1');

    expect(result).toBe(5);
    expect(mockAiSummaryRepo.countByUserIdAndMonth).toHaveBeenCalledWith(
      'user-1',
      expect.any(Date),
      expect.any(Date),
    );
  });

  it('当月の開始日と翌月の開始日を範囲として渡す', async () => {
    mockAiSummaryRepo.countByUserIdAndMonth.mockResolvedValue(0);

    await useCase.execute('user-1');

    const [, start, end] =
      mockAiSummaryRepo.countByUserIdAndMonth.mock.calls[0];

    expect(start.getDate()).toBe(1);
    expect(end.getDate()).toBe(1);
    expect(
      end.getMonth() === start.getMonth() + 1 ||
        (start.getMonth() === 11 && end.getMonth() === 0),
    ).toBe(true);
  });
});
