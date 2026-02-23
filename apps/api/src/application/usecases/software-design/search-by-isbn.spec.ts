import { SearchSoftwareDesignByISBNUseCase } from './search-by-isbn';

describe('SearchSoftwareDesignByISBNUseCase', () => {
  let useCase: SearchSoftwareDesignByISBNUseCase;

  beforeEach(() => {
    useCase = new SearchSoftwareDesignByISBNUseCase();
  });

  it('技術評論社のISBNで検索できる', () => {
    const result = useCase.execute('978-4-297-12345-6', 2025, 3);

    expect(result).not.toBeNull();
    expect(result!.yearMonth).toBe('202503');
  });

  it('該当しないISBNの場合はnullを返す', () => {
    const result = useCase.execute('978-1-234-56789-0');

    expect(result).toBeNull();
  });

  it('タイトルから年月を抽出できる', () => {
    const result = useCase.execute(
      '978-4-297-12345-6',
      undefined,
      undefined,
      'Software Design 2025年6月号',
    );

    expect(result).not.toBeNull();
    expect(result!.yearMonth).toBe('202506');
  });
});
