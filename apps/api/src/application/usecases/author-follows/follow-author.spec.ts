import { FollowAuthorUseCase } from './follow-author';
import { IAuthorFollowRepository } from '../../../domain/repositories/author-follow';
import { AuthorFollow } from '../../../domain/models/author-follow';

describe('FollowAuthorUseCase', () => {
  let useCase: FollowAuthorUseCase;
  let mockRepo: jest.Mocked<IAuthorFollowRepository>;

  beforeEach(() => {
    mockRepo = {
      findByUserId: jest.fn(),
      findByUserIdAndName: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IAuthorFollowRepository>;

    useCase = new FollowAuthorUseCase(mockRepo);
  });

  it('著者をフォローできる', async () => {
    mockRepo.findByUserIdAndName.mockResolvedValue(null);
    mockRepo.findByUserId.mockResolvedValue([]);
    mockRepo.save.mockImplementation((follow) => Promise.resolve(follow));

    const result = await useCase.execute({
      userId: 'user-1',
      authorName: '村上春樹',
    });

    expect(result.authorName).toBe('村上春樹');
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it('フォロー済みの場合は既存のフォローを返す', async () => {
    const existing = AuthorFollow.fromDatabase(
      '1',
      'user-1',
      '村上春樹',
      new Date(),
    );
    mockRepo.findByUserIdAndName.mockResolvedValue(existing);

    const result = await useCase.execute({
      userId: 'user-1',
      authorName: '村上春樹',
    });

    expect(result).toBe(existing);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('上限(50人)を超える場合はエラー', async () => {
    mockRepo.findByUserIdAndName.mockResolvedValue(null);
    mockRepo.findByUserId.mockResolvedValue(
      Array.from({ length: 50 }, (_, i) =>
        AuthorFollow.fromDatabase(String(i), 'user-1', `著者${i}`, new Date()),
      ),
    );

    await expect(
      useCase.execute({ userId: 'user-1', authorName: '新しい著者' }),
    ).rejects.toThrow('フォローできる著者は50人までです');
  });
});
