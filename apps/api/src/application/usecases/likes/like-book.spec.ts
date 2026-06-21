import { LikeBookUseCase } from './like-book';
import { ILikeRepository } from '../../../domain/repositories/like';
import { INotificationRepository } from '../../../domain/repositories/notification';

describe('LikeBookUseCase', () => {
  let useCase: LikeBookUseCase;
  let mockLikeRepo: jest.Mocked<ILikeRepository>;
  let mockNotificationRepo: jest.Mocked<INotificationRepository>;

  beforeEach(() => {
    mockLikeRepo = {
      like: jest.fn(),
      unlike: jest.fn(),
      getLikedBookIds: jest.fn(),
      countByBook: jest.fn(),
    } as unknown as jest.Mocked<ILikeRepository>;
    mockNotificationRepo = {
      create: jest.fn(),
      findByUser: jest.fn(),
      countUnread: jest.fn(),
      markAllRead: jest.fn(),
    } as unknown as jest.Mocked<INotificationRepository>;

    useCase = new LikeBookUseCase(mockLikeRepo, mockNotificationRepo);
  });

  it('新規いいねで本の所有者に通知が作成され、いいね数を返す', async () => {
    mockLikeRepo.like.mockResolvedValue({
      created: true,
      bookOwnerId: 'owner',
    });
    mockLikeRepo.countByBook.mockResolvedValue(3);

    const count = await useCase.execute({ kind: 'user', userId: 'liker' }, 1);

    expect(count).toBe(3);
    expect(mockNotificationRepo.create).toHaveBeenCalledWith({
      userId: 'owner',
      actorId: 'liker',
      actorAnonymousId: null,
      type: 'like',
      bookId: 1,
    });
  });

  it('匿名ユーザーのいいねで匿名として通知が作成される', async () => {
    mockLikeRepo.like.mockResolvedValue({
      created: true,
      bookOwnerId: 'owner',
    });
    mockLikeRepo.countByBook.mockResolvedValue(5);

    const count = await useCase.execute(
      { kind: 'anonymous', anonymousId: 'anon-123' },
      1,
    );

    expect(count).toBe(5);
    expect(mockNotificationRepo.create).toHaveBeenCalledWith({
      userId: 'owner',
      actorId: null,
      actorAnonymousId: 'anon-123',
      type: 'like',
      bookId: 1,
    });
  });

  it('既にいいね済みなら通知を作成しない', async () => {
    mockLikeRepo.like.mockResolvedValue({
      created: false,
      bookOwnerId: 'owner',
    });
    mockLikeRepo.countByBook.mockResolvedValue(3);

    await useCase.execute({ kind: 'user', userId: 'liker' }, 1);

    expect(mockNotificationRepo.create).not.toHaveBeenCalled();
  });
});
