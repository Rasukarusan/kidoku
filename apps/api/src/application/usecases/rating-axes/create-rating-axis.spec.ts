import { CreateRatingAxisUseCase } from './create-rating-axis';
import { IRatingAxisRepository } from '../../../domain/repositories/rating-axis';
import { RatingAxis } from '../../../domain/models/rating-axis';

describe('CreateRatingAxisUseCase', () => {
  let useCase: CreateRatingAxisUseCase;
  let mockRepo: jest.Mocked<IRatingAxisRepository>;

  beforeEach(() => {
    mockRepo = {
      findByUserId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findRatingsByBookId: jest.fn(),
      setRating: jest.fn(),
    } as unknown as jest.Mocked<IRatingAxisRepository>;

    useCase = new CreateRatingAxisUseCase(mockRepo);
  });

  it('評価軸を作成できる', async () => {
    mockRepo.findByUserId.mockResolvedValue([]);
    mockRepo.save.mockImplementation((axis) => Promise.resolve(axis));

    const result = await useCase.execute({ userId: 'user-1', name: '没入度' });

    expect(result.name).toBe('没入度');
    expect(result.order).toBe(1);
  });

  it('同名の軸が存在する場合はエラー', async () => {
    mockRepo.findByUserId.mockResolvedValue([
      RatingAxis.fromDatabase('1', 'user-1', '没入度', 1, new Date()),
    ]);

    await expect(
      useCase.execute({ userId: 'user-1', name: '没入度' }),
    ).rejects.toThrow('同じ名前の評価軸がすでに存在します');
  });

  it('上限(10個)を超える場合はエラー', async () => {
    mockRepo.findByUserId.mockResolvedValue(
      Array.from({ length: 10 }, (_, i) =>
        RatingAxis.fromDatabase(String(i), 'user-1', `軸${i}`, i, new Date()),
      ),
    );

    await expect(
      useCase.execute({ userId: 'user-1', name: '新しい軸' }),
    ).rejects.toThrow('評価軸は10個まで作成できます');
  });
});
