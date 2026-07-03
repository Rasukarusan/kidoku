import { NotFoundException } from '@nestjs/common';
import { SetBookTagsUseCase } from './set-book-tags';
import { ITagRepository } from '../../../domain/repositories/tag';
import { IBookRepository } from '../../../domain/repositories/book';
import { Book } from '../../../domain/models/book';

describe('SetBookTagsUseCase', () => {
  let useCase: SetBookTagsUseCase;
  let mockTagRepo: jest.Mocked<ITagRepository>;
  let mockBookRepo: jest.Mocked<IBookRepository>;

  beforeEach(() => {
    mockTagRepo = {
      findByUserIdWithCount: jest.fn(),
      findNamesByBookId: jest.fn(),
      findBooksByTagName: jest.fn(),
      replaceBookTags: jest.fn(),
    } as unknown as jest.Mocked<ITagRepository>;
    mockBookRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<IBookRepository>;

    useCase = new SetBookTagsUseCase(mockTagRepo, mockBookRepo);
  });

  it('自分の本にタグを設定できる', async () => {
    mockBookRepo.findById.mockResolvedValue({
      userId: 'user-1',
    } as unknown as Book);
    mockTagRepo.replaceBookTags.mockResolvedValue(['哲学', '積読']);

    const result = await useCase.execute({
      userId: 'user-1',
      bookId: 1,
      tags: ['哲学', '積読', '  '],
    });

    expect(result).toEqual(['哲学', '積読']);
    // 空白のみのタグは除外して渡される
    expect(mockTagRepo.replaceBookTags).toHaveBeenCalledWith(1, 'user-1', [
      '哲学',
      '積読',
    ]);
  });

  it('他人の本にはNotFoundException', async () => {
    mockBookRepo.findById.mockResolvedValue({
      userId: 'other',
    } as unknown as Book);

    await expect(
      useCase.execute({ userId: 'user-1', bookId: 1, tags: ['タグ'] }),
    ).rejects.toThrow(NotFoundException);
    expect(mockTagRepo.replaceBookTags).not.toHaveBeenCalled();
  });

  it('タグが多すぎる場合はエラー', async () => {
    mockBookRepo.findById.mockResolvedValue({
      userId: 'user-1',
    } as unknown as Book);

    await expect(
      useCase.execute({
        userId: 'user-1',
        bookId: 1,
        tags: Array.from({ length: 21 }, (_, i) => `タグ${i}`),
      }),
    ).rejects.toThrow('タグは1冊につき20個までしか設定できません');
  });
});
