import { DeleteAiSummaryUseCase } from './delete-ai-summary';
import { IAiSummaryRepository } from '../../../domain/repositories/ai-summary';

describe('DeleteAiSummaryUseCase', () => {
  let useCase: DeleteAiSummaryUseCase;
  let mockAiSummaryRepo: jest.Mocked<IAiSummaryRepository>;

  beforeEach(() => {
    mockAiSummaryRepo = {
      countByUserIdAndMonth: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IAiSummaryRepository>;

    useCase = new DeleteAiSummaryUseCase(mockAiSummaryRepo);
  });

  it('AIサマリーを削除できる', async () => {
    mockAiSummaryRepo.delete.mockResolvedValue(1);

    const result = await useCase.execute(1, 'user-1');

    expect(result).toBe(1);
    expect(mockAiSummaryRepo.delete).toHaveBeenCalledWith(1, 'user-1');
  });

  it('削除結果の件数を返す', async () => {
    mockAiSummaryRepo.delete.mockResolvedValue(0);

    const result = await useCase.execute(999, 'user-1');

    expect(result).toBe(0);
  });
});
