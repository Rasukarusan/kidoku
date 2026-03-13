import { RakutenBooksRepository } from './rakuten-books';

describe('RakutenBooksRepository', () => {
  let repository: RakutenBooksRepository;

  beforeEach(() => {
    repository = new RakutenBooksRepository();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('RAKUTEN_APPLICATION_ID が未設定の場合エラーをスローする', async () => {
    delete process.env.RAKUTEN_APPLICATION_ID;

    await expect(repository.searchByTitle('テスト')).rejects.toThrow(
      '楽天ブックスAPIの設定が不足しています',
    );
  });

  it('APIレスポンスを正しくマッピングする', async () => {
    process.env.RAKUTEN_APPLICATION_ID = 'test-app-id';

    const mockResponse = {
      Items: [
        {
          Item: {
            isbn: '9784297123456',
            title: 'テスト書籍',
            author: 'テスト著者',
            booksGenreId: '001004',
            largeImageUrl: 'http://example.com/large.jpg',
            mediumImageUrl: 'http://example.com/medium.jpg',
          },
        },
      ],
    };

    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await repository.searchByTitle('テスト');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: '9784297123456',
      title: 'テスト書籍',
      author: 'テスト著者',
      category: '001004',
      image: 'https://example.com/large.jpg',
    });
  });

  it('検索結果がない場合は空配列を返す', async () => {
    process.env.RAKUTEN_APPLICATION_ID = 'test-app-id';

    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ Items: [] }),
    } as Response);

    const result = await repository.searchByTitle('存在しない本');

    expect(result).toHaveLength(0);
  });

  it('APIエラー時にエラーをスローする', async () => {
    process.env.RAKUTEN_APPLICATION_ID = 'test-app-id';

    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as Response);

    await expect(repository.searchByTitle('テスト')).rejects.toThrow(
      '楽天ブックスAPIがエラーを返しました',
    );
  });

  it('接続エラー時にエラーをスローする', async () => {
    process.env.RAKUTEN_APPLICATION_ID = 'test-app-id';

    jest
      .spyOn(global, 'fetch')
      .mockRejectedValue(new Error('Network error'));

    await expect(repository.searchByTitle('テスト')).rejects.toThrow(
      '楽天ブックスAPIへの接続に失敗しました',
    );
  });

  it('画像URLがない場合はデフォルト画像を使用する', async () => {
    process.env.RAKUTEN_APPLICATION_ID = 'test-app-id';

    const mockResponse = {
      Items: [
        {
          Item: {
            isbn: '9784297123456',
            title: 'テスト書籍',
            author: 'テスト著者',
            booksGenreId: '001004',
            largeImageUrl: '',
            mediumImageUrl: '',
          },
        },
      ],
    };

    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await repository.searchByTitle('テスト');

    expect(result[0].image).toBe('/no-image.png');
  });
});
