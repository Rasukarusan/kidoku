import { NotFoundException } from '@nestjs/common';
import { GetBookUseCase } from '../get-book';
import { IBookRepository } from '../../../../domain/repositories/book';
import { Book } from '../../../../domain/models/book';

describe('GetBookUseCase', () => {
  let useCase: GetBookUseCase;
  let mockBookRepo: jest.Mocked<IBookRepository>;

  beforeEach(() => {
    mockBookRepo = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findBySheetId: jest.fn(),
      findByUserIdAndSheetId: jest.fn(),
      findByUserIdAndSheetName: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findAllForSearch: jest.fn(),
      findForSearchById: jest.fn(),
      getCategories: jest.fn(),
    } as unknown as jest.Mocked<IBookRepository>;

    useCase = new GetBookUseCase(mockBookRepo);
  });

  it('所有する書籍を取得できる', async () => {
    const book = Book.fromDatabase(
      '1',
      'user-1',
      1,
      'テスト書籍',
      '著者',
      'カテゴリ',
      'image.jpg',
      '★',
      'メモ',
      false,
      false,
      null,
      new Date(),
      new Date(),
    );

    mockBookRepo.findById.mockResolvedValue(book);

    const result = await useCase.execute('user-1', '1');
    expect(result.title).toBe('テスト書籍');
  });

  it('書籍が見つからない場合はNotFoundExceptionを投げる', async () => {
    mockBookRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('user-1', '999')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('他ユーザーの書籍はNotFoundExceptionを投げる', async () => {
    const book = Book.fromDatabase(
      '1',
      'other-user',
      1,
      'テスト書籍',
      '著者',
      'カテゴリ',
      'image.jpg',
      '★',
      'メモ',
      false,
      false,
      null,
      new Date(),
      new Date(),
    );

    mockBookRepo.findById.mockResolvedValue(book);

    await expect(useCase.execute('user-1', '1')).rejects.toThrow(
      NotFoundException,
    );
  });
});
