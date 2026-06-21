import { CreateBookCommentUseCase } from './create-book-comment';
import { IBookCommentRepository } from '../../../domain/repositories/book-comment';
import { INotificationRepository } from '../../../domain/repositories/notification';
import { BookComment } from '../../../domain/models/book-comment';

describe('CreateBookCommentUseCase', () => {
  let useCase: CreateBookCommentUseCase;
  let mockRepo: jest.Mocked<IBookCommentRepository>;
  let mockNotificationRepo: jest.Mocked<INotificationRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findByBook: jest.fn(),
      delete: jest.fn(),
      countByBook: jest.fn(),
    } as unknown as jest.Mocked<IBookCommentRepository>;
    mockNotificationRepo = {
      create: jest.fn(),
      findByUser: jest.fn(),
      countUnread: jest.fn(),
      markAllRead: jest.fn(),
    } as unknown as jest.Mocked<INotificationRepository>;

    useCase = new CreateBookCommentUseCase(mockRepo, mockNotificationRepo);
  });

  it('コメントを作成し、本の所有者に通知を送る', async () => {
    const saved = BookComment.fromDatabase(
      1,
      10,
      'commenter',
      'いいね',
      new Date(),
      new Date(),
      'コメント太郎',
      null,
    );
    mockRepo.create.mockResolvedValue({
      comment: saved,
      bookOwnerId: 'owner',
    });

    const result = await useCase.execute('commenter', 10, 'いいね');

    expect(result).toBe(saved);
    expect(mockNotificationRepo.create).toHaveBeenCalledWith({
      userId: 'owner',
      actorId: 'commenter',
      type: 'comment',
      bookId: 10,
    });
  });

  it('本の所有者が取得できない場合は通知を送らない', async () => {
    const saved = BookComment.fromDatabase(
      1,
      10,
      'commenter',
      'いいね',
      new Date(),
      new Date(),
      'コメント太郎',
      null,
    );
    mockRepo.create.mockResolvedValue({ comment: saved, bookOwnerId: null });

    await useCase.execute('commenter', 10, 'いいね');

    expect(mockNotificationRepo.create).not.toHaveBeenCalled();
  });

  it('不正な内容はドメインバリデーションで弾かれる', async () => {
    await expect(useCase.execute('commenter', 10, '   ')).rejects.toThrow(
      'コメントを入力してください',
    );
    expect(mockRepo.create).not.toHaveBeenCalled();
  });
});
