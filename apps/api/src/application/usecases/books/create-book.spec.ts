import { CreateBookUseCase } from './create-book';
import { IBookRepository } from '../../../domain/repositories/book';
import { ISearchRepository } from '../../../domain/repositories/search';
import { Book } from '../../../domain/models/book';

describe('CreateBookUseCase', () => {
  let useCase: CreateBookUseCase;
  let mockBookRepo: jest.Mocked<IBookRepository>;
  let mockSearchRepo: jest.Mocked<ISearchRepository>;

  beforeEach(() => {
    mockBookRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findBySheetId: jest.fn(),
      findByUserIdAndSheetId: jest.fn(),
      findByUserIdAndSheetName: jest.fn(),
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

    useCase = new CreateBookUseCase(mockBookRepo, mockSearchRepo);
  });

  const validParams = {
    userId: 'user-1',
    sheetId: 1,
    title: 'テスト書籍',
    author: '著者',
    category: 'カテゴリ',
    image: 'image.jpg',
    impression: '★',
    memo: 'メモ',
    isPublicMemo: false,
    finished: null as Date | null,
  };

  it('書籍を作成して保存する', async () => {
    const savedBook = Book.fromDatabase(
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

    mockBookRepo.save.mockResolvedValue(savedBook);
    mockBookRepo.findForSearchById.mockResolvedValue({
      id: '1',
      title: 'テスト書籍',
      author: '著者',
      image: 'image.jpg',
      memo: '',
      isPublicMemo: false,
      userName: 'user',
      userImage: null,
      sheetName: 'シート1',
    });

    const result = await useCase.execute(validParams);

    expect(result.title).toBe('テスト書籍');
    expect(mockBookRepo.save).toHaveBeenCalled();
  });

  it('保存後にMeiliSearchインデックスを更新する', async () => {
    const savedBook = Book.fromDatabase(
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

    mockBookRepo.save.mockResolvedValue(savedBook);
    mockBookRepo.findForSearchById.mockResolvedValue({
      id: '1',
      title: 'テスト書籍',
      author: '著者',
      image: 'image.jpg',
      memo: '',
      isPublicMemo: false,
      userName: 'user',
      userImage: null,
      sheetName: 'シート1',
    });

    await useCase.execute(validParams);

    expect(mockSearchRepo.updateDocument).toHaveBeenCalledWith({
      id: '1',
      title: 'テスト書籍',
      author: '著者',
      image: 'image.jpg',
      memo: '',
      username: 'user',
      userImage: null,
      sheet: 'シート1',
    });
  });

  it('検索データが見つからない場合はインデックス更新をスキップする', async () => {
    const savedBook = Book.fromDatabase(
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

    mockBookRepo.save.mockResolvedValue(savedBook);
    mockBookRepo.findForSearchById.mockResolvedValue(null);

    await useCase.execute(validParams);

    expect(mockSearchRepo.updateDocument).not.toHaveBeenCalled();
  });

  it('公開メモの場合はメモ内容をインデックスに含める', async () => {
    const savedBook = Book.fromDatabase(
      '1',
      'user-1',
      1,
      'テスト書籍',
      '著者',
      'カテゴリ',
      'image.jpg',
      '★',
      '公開メモ',
      true,
      false,
      null,
      new Date(),
      new Date(),
    );

    mockBookRepo.save.mockResolvedValue(savedBook);
    mockBookRepo.findForSearchById.mockResolvedValue({
      id: '1',
      title: 'テスト書籍',
      author: '著者',
      image: 'image.jpg',
      memo: '公開メモ',
      isPublicMemo: true,
      userName: 'user',
      userImage: null,
      sheetName: 'シート1',
    });

    await useCase.execute({
      ...validParams,
      isPublicMemo: true,
      memo: '公開メモ',
    });

    expect(mockSearchRepo.updateDocument).toHaveBeenCalledWith(
      expect.objectContaining({ memo: '公開メモ' }),
    );
  });
});
