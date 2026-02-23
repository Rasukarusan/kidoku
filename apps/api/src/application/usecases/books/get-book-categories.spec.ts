import { GetBookCategoriesUseCase } from './get-book-categories';
import { IBookRepository } from '../../../domain/repositories/book';

describe('GetBookCategoriesUseCase', () => {
  let useCase: GetBookCategoriesUseCase;
  let mockBookRepo: jest.Mocked<IBookRepository>;

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

    useCase = new GetBookCategoriesUseCase(mockBookRepo);
  });

  it('ユーザーの書籍カテゴリ一覧を取得できる', async () => {
    mockBookRepo.getCategories.mockResolvedValue([
      '技術書',
      'ビジネス',
      '小説',
    ]);

    const result = await useCase.execute('user-1');

    expect(result).toEqual(['技術書', 'ビジネス', '小説']);
    expect(mockBookRepo.getCategories).toHaveBeenCalledWith('user-1');
  });

  it('カテゴリが存在しない場合は空配列を返す', async () => {
    mockBookRepo.getCategories.mockResolvedValue([]);

    const result = await useCase.execute('user-1');

    expect(result).toEqual([]);
  });
});
