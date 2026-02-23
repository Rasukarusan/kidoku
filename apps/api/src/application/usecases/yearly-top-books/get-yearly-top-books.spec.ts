import { GetYearlyTopBooksUseCase } from './get-yearly-top-books';
import {
  IYearlyTopBookRepository,
  YearlyTopBookWithBook,
} from '../../../domain/repositories/yearly-top-book';

describe('GetYearlyTopBooksUseCase', () => {
  let useCase: GetYearlyTopBooksUseCase;
  let mockRepo: jest.Mocked<IYearlyTopBookRepository>;

  beforeEach(() => {
    mockRepo = {
      findByUserIdAndYear: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IYearlyTopBookRepository>;

    useCase = new GetYearlyTopBooksUseCase(mockRepo);
  });

  it('指定年の年間ベスト書籍一覧を取得できる', async () => {
    const mockBooks: YearlyTopBookWithBook[] = [
      {
        year: '2025',
        order: 1,
        book: { id: 1, title: '書籍1', author: '著者1', image: 'img1.jpg' },
      },
      {
        year: '2025',
        order: 2,
        book: { id: 2, title: '書籍2', author: '著者2', image: 'img2.jpg' },
      },
    ];
    mockRepo.findByUserIdAndYear.mockResolvedValue(mockBooks);

    const result = await useCase.execute('user-1', '2025');

    expect(result).toHaveLength(2);
    expect(result[0].order).toBe(1);
    expect(mockRepo.findByUserIdAndYear).toHaveBeenCalledWith('user-1', '2025');
  });

  it('結果が空の場合は空配列を返す', async () => {
    mockRepo.findByUserIdAndYear.mockResolvedValue([]);

    const result = await useCase.execute('user-1', '2025');

    expect(result).toEqual([]);
  });
});
