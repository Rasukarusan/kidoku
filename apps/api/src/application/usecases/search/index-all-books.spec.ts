import { IndexAllBooksUseCase } from './index-all-books';
import { IBookRepository } from '../../../domain/repositories/book';
import { ISearchRepository } from '../../../domain/repositories/search';

describe('IndexAllBooksUseCase', () => {
  let useCase: IndexAllBooksUseCase;
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

    useCase = new IndexAllBooksUseCase(mockBookRepo, mockSearchRepo);
  });

  it('全書籍を検索インデックスに登録できる', async () => {
    mockBookRepo.findAllForSearch.mockResolvedValue([
      {
        id: '1',
        title: '書籍1',
        author: '著者1',
        image: 'img1.jpg',
        memo: '公開メモ',
        isPublicMemo: true,
        userName: 'user1',
        userImage: null,
        sheetName: '2025',
      },
      {
        id: '2',
        title: '書籍2',
        author: '著者2',
        image: 'img2.jpg',
        memo: '非公開メモ',
        isPublicMemo: false,
        userName: 'user2',
        userImage: 'avatar.jpg',
        sheetName: '2024',
      },
    ]);
    mockSearchRepo.addDocuments.mockResolvedValue(undefined);

    const result = await useCase.execute();

    expect(result.count).toBe(2);
    expect(mockSearchRepo.addDocuments).toHaveBeenCalledWith([
      {
        id: '1',
        title: '書籍1',
        author: '著者1',
        image: 'img1.jpg',
        memo: '公開メモ',
        username: 'user1',
        userImage: null,
        sheet: '2025',
      },
      {
        id: '2',
        title: '書籍2',
        author: '著者2',
        image: 'img2.jpg',
        memo: '',
        username: 'user2',
        userImage: 'avatar.jpg',
        sheet: '2024',
      },
    ]);
  });

  it('非公開メモは検索インデックスに含めない', async () => {
    mockBookRepo.findAllForSearch.mockResolvedValue([
      {
        id: '1',
        title: '書籍1',
        author: '著者1',
        image: 'img1.jpg',
        memo: '秘密のメモ',
        isPublicMemo: false,
        userName: 'user1',
        userImage: null,
        sheetName: '2025',
      },
    ]);
    mockSearchRepo.addDocuments.mockResolvedValue(undefined);

    await useCase.execute();

    expect(mockSearchRepo.addDocuments).toHaveBeenCalledWith([
      expect.objectContaining({ memo: '' }),
    ]);
  });

  it('書籍が存在しない場合はcount 0を返す', async () => {
    mockBookRepo.findAllForSearch.mockResolvedValue([]);
    mockSearchRepo.addDocuments.mockResolvedValue(undefined);

    const result = await useCase.execute();

    expect(result.count).toBe(0);
  });
});
