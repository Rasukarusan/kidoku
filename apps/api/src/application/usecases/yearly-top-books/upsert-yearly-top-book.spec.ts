import { UpsertYearlyTopBookUseCase } from './upsert-yearly-top-book';
import { IYearlyTopBookRepository } from '../../../domain/repositories/yearly-top-book';

describe('UpsertYearlyTopBookUseCase', () => {
  let useCase: UpsertYearlyTopBookUseCase;
  let mockRepo: jest.Mocked<IYearlyTopBookRepository>;

  beforeEach(() => {
    mockRepo = {
      findByUserIdAndYear: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IYearlyTopBookRepository>;

    useCase = new UpsertYearlyTopBookUseCase(mockRepo);
  });

  it('年間ベスト書籍を登録・更新できる', async () => {
    mockRepo.upsert.mockResolvedValue(undefined);

    await useCase.execute('user-1', '2025', 1, 100);

    expect(mockRepo.upsert).toHaveBeenCalledWith('user-1', '2025', 1, 100);
  });
});
