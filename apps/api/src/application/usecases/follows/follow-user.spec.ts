import { FollowUserUseCase } from './follow-user';
import { IFollowRepository } from '../../../domain/repositories/follow';
import { INotificationRepository } from '../../../domain/repositories/notification';

describe('FollowUserUseCase', () => {
  let useCase: FollowUserUseCase;
  let mockFollowRepo: jest.Mocked<IFollowRepository>;
  let mockNotificationRepo: jest.Mocked<INotificationRepository>;

  beforeEach(() => {
    mockFollowRepo = {
      follow: jest.fn(),
      unfollow: jest.fn(),
      isFollowing: jest.fn(),
      countFollowers: jest.fn(),
      countFollowing: jest.fn(),
      findUserIdByName: jest.fn(),
      getFeedBooks: jest.fn(),
    } as unknown as jest.Mocked<IFollowRepository>;
    mockNotificationRepo = {
      create: jest.fn(),
      findByUser: jest.fn(),
      countUnread: jest.fn(),
      markAllRead: jest.fn(),
    } as unknown as jest.Mocked<INotificationRepository>;

    useCase = new FollowUserUseCase(mockFollowRepo, mockNotificationRepo);
  });

  it('フォローすると相手に通知が作成される', async () => {
    mockFollowRepo.follow.mockResolvedValue({ created: true });

    await useCase.execute('follower-1', 'following-1');

    expect(mockFollowRepo.follow).toHaveBeenCalledWith(
      'follower-1',
      'following-1',
    );
    expect(mockNotificationRepo.create).toHaveBeenCalledWith({
      userId: 'following-1',
      actorId: 'follower-1',
      type: 'follow',
    });
  });

  it('既にフォロー済みの場合は通知を作成しない', async () => {
    mockFollowRepo.follow.mockResolvedValue({ created: false });

    await useCase.execute('follower-1', 'following-1');

    expect(mockNotificationRepo.create).not.toHaveBeenCalled();
  });

  it('自分自身はフォローできない', async () => {
    await expect(useCase.execute('user-1', 'user-1')).rejects.toThrow(
      '自分自身はフォローできません',
    );
    expect(mockFollowRepo.follow).not.toHaveBeenCalled();
  });
});
