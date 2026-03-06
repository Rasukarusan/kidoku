import { GoogleBooksRepository } from './google-books';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('GoogleBooksRepository', () => {
  let repository: GoogleBooksRepository;

  beforeEach(() => {
    repository = new GoogleBooksRepository();
    mockFetch.mockReset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const createResponse = (
    data: object,
    status = 200,
    statusText = 'OK',
  ): Response =>
    ({
      ok: status >= 200 && status < 300,
      status,
      statusText,
      json: () => Promise.resolve(data),
    }) as unknown as Response;

  const bookItem = {
    id: '1',
    volumeInfo: {
      title: 'テスト書籍',
      authors: ['著者A'],
      categories: ['技術'],
      imageLinks: { thumbnail: 'https://example.com/image.jpg' },
    },
  };

  it('正常にAPIを呼び出して結果を返す', async () => {
    mockFetch.mockResolvedValueOnce(
      createResponse({ items: [bookItem] }),
    );

    const result = await repository.searchByTitle('テスト');

    expect(result).toEqual([
      {
        id: '1',
        title: 'テスト書籍',
        author: '著者A',
        category: '技術',
        image: 'https://example.com/image.jpg',
      },
    ]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('429エラー時にリトライして成功する', async () => {
    mockFetch
      .mockResolvedValueOnce(
        createResponse({}, 429, 'Too Many Requests'),
      )
      .mockResolvedValueOnce(
        createResponse({ items: [bookItem] }),
      );

    const promise = repository.searchByTitle('テスト');

    // 1回目のリトライ待機（2^0 * 1000 = 1000ms）
    await jest.advanceTimersByTimeAsync(1000);

    const result = await promise;

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('テスト書籍');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('429エラーが続いてもmaxRetries回リトライする', async () => {
    mockFetch
      .mockResolvedValueOnce(
        createResponse({}, 429, 'Too Many Requests'),
      )
      .mockResolvedValueOnce(
        createResponse({}, 429, 'Too Many Requests'),
      )
      .mockResolvedValueOnce(
        createResponse({}, 429, 'Too Many Requests'),
      )
      .mockResolvedValueOnce(
        createResponse({ items: [bookItem] }),
      );

    const promise = repository.searchByTitle('テスト');

    // 1回目のリトライ待機（1000ms）
    await jest.advanceTimersByTimeAsync(1000);
    // 2回目のリトライ待機（2000ms）
    await jest.advanceTimersByTimeAsync(2000);
    // 3回目のリトライ待機（4000ms）
    await jest.advanceTimersByTimeAsync(4000);

    const result = await promise;

    expect(result).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledTimes(4);
  });

  it('maxRetries回リトライしても429の場合はエラーを投げる', async () => {
    jest.useRealTimers();

    mockFetch.mockResolvedValue(
      createResponse({}, 429, 'Too Many Requests'),
    );

    // maxRetriesを0に設定してすぐにエラーを投げるようにする
    Object.defineProperty(repository, 'maxRetries', { value: 0 });

    await expect(repository.searchByTitle('テスト')).rejects.toThrow(
      'Google Books APIがエラーを返しました（ステータス: 429）',
    );
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('ネットワークエラー時にリトライして成功する', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(
        createResponse({ items: [bookItem] }),
      );

    const promise = repository.searchByTitle('テスト');

    await jest.advanceTimersByTimeAsync(1000);

    const result = await promise;

    expect(result).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('ネットワークエラーがmaxRetries回続く場合はエラーを投げる', async () => {
    jest.useRealTimers();

    mockFetch.mockRejectedValue(new Error('Network error'));

    // maxRetriesを0に設定してすぐにエラーを投げるようにする
    Object.defineProperty(repository, 'maxRetries', { value: 0 });

    await expect(repository.searchByTitle('テスト')).rejects.toThrow(
      'Google Books APIへの接続に失敗しました',
    );
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('itemsが空の場合は空配列を返す', async () => {
    mockFetch.mockResolvedValueOnce(createResponse({}));

    const result = await repository.searchByTitle('テスト');

    expect(result).toEqual([]);
  });
});
