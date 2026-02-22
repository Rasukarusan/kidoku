import { SearchBooksUseCase } from '../search-books';
import { ISearchRepository } from '../../../../domain/repositories/search';

describe('SearchBooksUseCase', () => {
  let useCase: SearchBooksUseCase;
  let mockSearchRepo: jest.Mocked<ISearchRepository>;

  beforeEach(() => {
    mockSearchRepo = {
      addDocuments: jest.fn(),
      updateDocument: jest.fn(),
      deleteDocument: jest.fn(),
      search: jest.fn(),
    } as unknown as jest.Mocked<ISearchRepository>;

    useCase = new SearchBooksUseCase(mockSearchRepo);
  });

  it('検索クエリで書籍を検索できる', async () => {
    const searchResult = {
      hits: [
        {
          id: '1',
          title: 'テスト書籍',
          author: '著者',
          image: 'img.jpg',
          memo: '',
          username: 'user',
          userImage: null,
          sheet: 'シート1',
        },
      ],
      totalHits: 1,
      hitsPerPage: 20,
      page: 1,
      hasMore: false,
    };
    mockSearchRepo.search.mockResolvedValue(searchResult);

    const result = await useCase.execute('テスト');

    expect(result.hits).toHaveLength(1);
    expect(result.hits[0].title).toBe('テスト書籍');
    expect(mockSearchRepo.search).toHaveBeenCalledWith('テスト', 1);
  });

  it('ページ番号を指定して検索できる', async () => {
    mockSearchRepo.search.mockResolvedValue({
      hits: [],
      totalHits: 0,
      hitsPerPage: 20,
      page: 3,
      hasMore: false,
    });

    await useCase.execute('クエリ', 3);

    expect(mockSearchRepo.search).toHaveBeenCalledWith('クエリ', 3);
  });
});
