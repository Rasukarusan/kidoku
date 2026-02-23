import { DeleteYearlyTopBookUseCase } from './delete-yearly-top-book';
import { IYearlyTopBookRepository } from '../../../domain/repositories/yearly-top-book';

describe('DeleteYearlyTopBookUseCase', () => {
  let useCase: DeleteYearlyTopBookUseCase;
  let mockRepo: jest.Mocked<IYearlyTopBookRepository>;

  beforeEach(() => {
    mockRepo = {
      findByUserIdAndYear: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IYearlyTopBookRepository>;

    useCase = new DeleteYearlyTopBookUseCase(mockRepo);
  });

  it('年間ベスト書籍を削除できる', async () => {
    mockRepo.delete.mockResolvedValue(undefined);

    await useCase.execute('user-1', '2025', 1);

    expect(mockRepo.delete).toHaveBeenCalledWith('user-1', '2025', 1);
  });
});
