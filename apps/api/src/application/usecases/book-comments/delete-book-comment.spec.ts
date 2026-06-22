import { DeleteBookCommentUseCase } from './delete-book-comment';
import { IBookCommentRepository } from '../../../domain/repositories/book-comment';

describe('DeleteBookCommentUseCase', () => {
  let useCase: DeleteBookCommentUseCase;
  let mockRepo: jest.Mocked<IBookCommentRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findByBook: jest.fn(),
      delete: jest.fn(),
      countByBook: jest.fn(),
    } as unknown as jest.Mocked<IBookCommentRepository>;

    useCase = new DeleteBookCommentUseCase(mockRepo);
  });

  it('削除可能な場合は true を返す', async () => {
    mockRepo.delete.mockResolvedValue(true);
    const result = await useCase.execute('user-1', 5);
    expect(result).toBe(true);
    expect(mockRepo.delete).toHaveBeenCalledWith(5, 'user-1');
  });

  it('権限がない場合は false を返す', async () => {
    mockRepo.delete.mockResolvedValue(false);
    const result = await useCase.execute('user-1', 5);
    expect(result).toBe(false);
  });
});
