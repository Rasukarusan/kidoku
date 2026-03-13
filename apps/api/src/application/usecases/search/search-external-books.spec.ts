import { SearchExternalBooksUseCase } from './search-external-books';
import { IBookSearchRepository } from '../../../domain/repositories/book-search';

describe('SearchExternalBooksUseCase', () => {
  let useCase: SearchExternalBooksUseCase;
  let mockBookSearchRepo: jest.Mocked<IBookSearchRepository>;

  beforeEach(() => {
    mockBookSearchRepo = {
      searchByTitle: jest.fn(),
    } as unknown as jest.Mocked<IBookSearchRepository>;

    useCase = new SearchExternalBooksUseCase(mockBookSearchRepo);
  });

  it('タイトルで書籍を検索できる', async () => {
    const searchResult = [
      {
        id: '9784297123456',
        title: 'テスト書籍',
        author: 'テスト著者',
        category: '001004',
        image: 'https://example.com/image.jpg',
      },
    ];
    mockBookSearchRepo.searchByTitle.mockResolvedValue(searchResult);

    const result = await useCase.execute('テスト');

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('テスト書籍');
    expect(mockBookSearchRepo.searchByTitle).toHaveBeenCalledWith('テスト');
  });

  it('検索結果がない場合は空配列を返す', async () => {
    mockBookSearchRepo.searchByTitle.mockResolvedValue([]);

    const result = await useCase.execute('存在しない本');

    expect(result).toHaveLength(0);
  });
});
