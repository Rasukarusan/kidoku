import { NotFoundException } from '@nestjs/common';
import { UpdateBookUseCase } from '../update-book';
import { IBookRepository } from '../../../../domain/repositories/book';
import { ISearchRepository } from '../../../../domain/repositories/search';
import { Book } from '../../../../domain/models/book';

describe('UpdateBookUseCase', () => {
  let useCase: UpdateBookUseCase;
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

    useCase = new UpdateBookUseCase(mockBookRepo, mockSearchRepo);
  });

  const existingBook = () =>
    Book.fromDatabase(
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

  it('書籍を更新できる', async () => {
    const book = existingBook();
    mockBookRepo.findById.mockResolvedValue(book);
    mockBookRepo.save.mockResolvedValue(book);
    mockBookRepo.findForSearchById.mockResolvedValue(null);

    const result = await useCase.execute('user-1', '1', {
      title: '新タイトル',
    });

    expect(result.title).toBe('新タイトル');
    expect(mockBookRepo.save).toHaveBeenCalled();
  });

  it('書籍が見つからない場合はNotFoundExceptionを投げる', async () => {
    mockBookRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('user-1', '999', { title: '新タイトル' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('他ユーザーの書籍はNotFoundExceptionを投げる', async () => {
    mockBookRepo.findById.mockResolvedValue(existingBook());

    await expect(
      useCase.execute('other-user', '1', { title: '新タイトル' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('更新後にMeiliSearchインデックスを更新する', async () => {
    const book = existingBook();
    mockBookRepo.findById.mockResolvedValue(book);
    mockBookRepo.save.mockResolvedValue(book);
    mockBookRepo.findForSearchById.mockResolvedValue({
      id: '1',
      title: '新タイトル',
      author: '著者',
      image: 'image.jpg',
      memo: '',
      isPublicMemo: false,
      userName: 'user',
      userImage: null,
      sheetName: 'シート1',
    });

    await useCase.execute('user-1', '1', { title: '新タイトル' });

    expect(mockSearchRepo.updateDocument).toHaveBeenCalled();
  });
});
