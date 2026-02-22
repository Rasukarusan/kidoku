import { NotFoundException } from '@nestjs/common';
import { DeleteBookUseCase } from '../delete-book';
import { IBookRepository } from '../../../../domain/repositories/book';
import { ISearchRepository } from '../../../../domain/repositories/search';
import { Book } from '../../../../domain/models/book';

describe('DeleteBookUseCase', () => {
  let useCase: DeleteBookUseCase;
  let mockBookRepo: jest.Mocked<IBookRepository>;
  let mockSearchRepo: jest.Mocked<ISearchRepository>;

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

    mockSearchRepo = {
      addDocuments: jest.fn(),
      updateDocument: jest.fn(),
      deleteDocument: jest.fn(),
      search: jest.fn(),
    } as unknown as jest.Mocked<ISearchRepository>;

    useCase = new DeleteBookUseCase(mockBookRepo, mockSearchRepo);
  });

  it('所有する書籍を削除できる', async () => {
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

    await useCase.execute('user-1', '1');

    expect(mockBookRepo.delete).toHaveBeenCalledWith('1', 'user-1');
    expect(mockSearchRepo.deleteDocument).toHaveBeenCalledWith('1');
  });

  it('書籍が見つからない場合はNotFoundExceptionを投げる', async () => {
    mockBookRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('user-1', '999')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('他ユーザーの書籍を削除しようとするとNotFoundExceptionを投げる', async () => {
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

    expect(mockBookRepo.delete).not.toHaveBeenCalled();
    expect(mockSearchRepo.deleteDocument).not.toHaveBeenCalled();
  });
});
