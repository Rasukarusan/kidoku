import { GetBookCommentsUseCase } from './get-book-comments';
import { IBookCommentRepository } from '../../../domain/repositories/book-comment';
import { BookComment } from '../../../domain/models/book-comment';

describe('GetBookCommentsUseCase', () => {
  let useCase: GetBookCommentsUseCase;
  let mockRepo: jest.Mocked<IBookCommentRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findByBook: jest.fn(),
      delete: jest.fn(),
      countByBook: jest.fn(),
    } as unknown as jest.Mocked<IBookCommentRepository>;

    useCase = new GetBookCommentsUseCase(mockRepo);
  });

  it('指定した本のコメント一覧を返す', async () => {
    const comment = BookComment.fromDatabase(
      1,
      10,
      'user-1',
      'コメント',
      new Date(),
      new Date(),
      'ユーザー',
      null,
    );
    mockRepo.findByBook.mockResolvedValue({
      items: [comment],
      total: 1,
      hasMore: false,
    });

    const result = await useCase.execute(10, 20, 0);

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(mockRepo.findByBook).toHaveBeenCalledWith(10, 20, 0);
  });
});
