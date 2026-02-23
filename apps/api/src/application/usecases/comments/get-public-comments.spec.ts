import { GetPublicCommentsUseCase } from './get-public-comments';
import { ICommentRepository } from '../../../domain/repositories/comment';
import { Comment } from '../../../domain/models/comment';

describe('GetPublicCommentsUseCase', () => {
  let useCase: GetPublicCommentsUseCase;
  let mockCommentRepo: jest.Mocked<ICommentRepository>;

  beforeEach(() => {
    mockCommentRepo = {
      findPublicComments: jest.fn(),
    } as unknown as jest.Mocked<ICommentRepository>;

    useCase = new GetPublicCommentsUseCase(mockCommentRepo);
  });

  it('公開コメント一覧をページネーション付きで取得できる', async () => {
    const comments = [
      Comment.fromDatabase(
        '1',
        '書籍タイトル',
        'コメント本文',
        'img.jpg',
        new Date(),
        'username',
        'https://example.com/avatar.jpg',
        '1',
      ),
    ];
    mockCommentRepo.findPublicComments.mockResolvedValue({
      items: comments,
      total: 1,
      hasMore: false,
    });

    const result = await useCase.execute(10, 0);

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.hasMore).toBe(false);
    expect(mockCommentRepo.findPublicComments).toHaveBeenCalledWith(10, 0);
  });

  it('結果が空の場合も正しく返す', async () => {
    mockCommentRepo.findPublicComments.mockResolvedValue({
      items: [],
      total: 0,
      hasMore: false,
    });

    const result = await useCase.execute(10, 0);

    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });
});
