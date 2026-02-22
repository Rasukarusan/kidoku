import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { createAuthHeaders, TEST_USER_ID } from './helpers/auth.helper';
import { Book } from '../src/domain/models/book';

const now = new Date('2025-01-01T00:00:00.000Z');

interface MockBookParams {
  id?: string;
  userId?: string;
  sheetId?: number;
  title?: string;
  author?: string;
  category?: string;
  image?: string;
  impression?: string;
  memo?: string;
  isPublicMemo?: boolean;
  isPurchasable?: boolean;
  finished?: Date | null;
  created?: Date;
  updated?: Date;
}

function createMockBook(overrides: MockBookParams = {}): Book {
  return Book.fromDatabase(
    overrides.id ?? '1',
    overrides.userId ?? TEST_USER_ID,
    overrides.sheetId ?? 1,
    overrides.title ?? 'テスト書籍',
    overrides.author ?? 'テスト著者',
    overrides.category ?? 'プログラミング',
    overrides.image ?? 'https://example.com/image.jpg',
    overrides.impression ?? '面白い',
    overrides.memo ?? 'メモ内容',
    overrides.isPublicMemo ?? false,
    overrides.isPurchasable ?? false,
    overrides.finished ?? null,
    overrides.created ?? now,
    overrides.updated ?? now,
  );
}

describe('BookResolver (e2e)', () => {
  let app: INestApplication;
  const mockBookRepository = {
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
  };
  const mockSearchRepository = {
    addDocuments: jest.fn(),
    updateDocument: jest.fn(),
    search: jest.fn(),
    deleteDocument: jest.fn(),
  };

  beforeAll(async () => {
    const { app: testApp } = await createTestApp({
      bookRepository: mockBookRepository,
      searchRepository: mockSearchRepository,
    });
    app = testApp;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Query: books', () => {
    it('認証済みユーザーが書籍一覧を取得できる', async () => {
      const mockBooks = [
        createMockBook({ id: '1', title: '書籍1' }),
        createMockBook({ id: '2', title: '書籍2' }),
      ];
      mockBookRepository.findByUserId.mockResolvedValue(mockBooks);

      const query = `
        query {
          books {
            id
            title
            author
            category
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set(createAuthHeaders())
        .send({ query });

      expect(response.status).toBe(200);
      expect(response.body.data.books).toHaveLength(2);
      expect(response.body.data.books[0].title).toBe('書籍1');
      expect(response.body.data.books[1].title).toBe('書籍2');
    });

    it('sheetIdでフィルタリングして書籍を取得できる', async () => {
      const mockBooks = [createMockBook({ id: '1', sheetId: 5 })];
      mockBookRepository.findByUserIdAndSheetId.mockResolvedValue(mockBooks);

      const query = `
        query {
          books(input: { sheetId: 5 }) {
            id
            sheetId
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set(createAuthHeaders())
        .send({ query });

      expect(response.status).toBe(200);
      expect(response.body.data.books).toHaveLength(1);
      expect(response.body.data.books[0].sheetId).toBe(5);
    });

    it('未認証の場合はエラーを返す', async () => {
      const query = `
        query {
          books {
            id
            title
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        'Missing authentication headers',
      );
    });
  });

  describe('Query: book', () => {
    it('IDを指定して書籍を取得できる', async () => {
      const mockBook = createMockBook({ id: '42', title: '特定の書籍' });
      mockBookRepository.findById.mockResolvedValue(mockBook);

      const query = `
        query {
          book(input: { id: "42" }) {
            id
            title
            author
            impression
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set(createAuthHeaders())
        .send({ query });

      expect(response.status).toBe(200);
      expect(response.body.data.book.id).toBe('42');
      expect(response.body.data.book.title).toBe('特定の書籍');
    });

    it('存在しない書籍はnullを返す', async () => {
      mockBookRepository.findById.mockResolvedValue(null);

      const query = `
        query {
          book(input: { id: "999" }) {
            id
            title
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set(createAuthHeaders())
        .send({ query });

      expect(response.status).toBe(200);
      expect(response.body.data.book).toBeNull();
    });
  });

  describe('Query: bookCategories', () => {
    it('カテゴリ一覧を取得できる', async () => {
      mockBookRepository.getCategories.mockResolvedValue([
        'プログラミング',
        '小説',
        'ビジネス',
      ]);

      const query = `
        query {
          bookCategories
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set(createAuthHeaders())
        .send({ query });

      expect(response.status).toBe(200);
      expect(response.body.data.bookCategories).toEqual([
        'プログラミング',
        '小説',
        'ビジネス',
      ]);
    });
  });

  describe('Mutation: createBook', () => {
    it('新しい書籍を作成できる', async () => {
      mockBookRepository.save.mockImplementation((book: Book) => {
        return Promise.resolve(
          Book.fromDatabase(
            '100',
            book.userId,
            book.sheetId,
            book.title,
            book.author,
            book.category,
            book.image,
            book.impression,
            book.memo,
            book.isPublicMemo,
            book.isPurchasable,
            book.finished,
            now,
            now,
          ),
        );
      });
      mockSearchRepository.updateDocument.mockResolvedValue(undefined);
      mockBookRepository.findForSearchById.mockResolvedValue({
        id: '100',
        title: '新しい書籍',
        author: '著者名',
        image: '',
        memo: '',
        isPublicMemo: false,
        userName: 'user',
        userImage: null,
        sheetName: 'sheet',
      });

      const mutation = `
        mutation {
          createBook(input: {
            sheetId: 1
            title: "新しい書籍"
            author: "著者名"
            category: "技術書"
            image: "https://example.com/new.jpg"
            impression: "良い本"
            memo: "メモ"
            isPublicMemo: false
          }) {
            id
            title
            author
            category
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set(createAuthHeaders())
        .send({ query: mutation });

      expect(response.status).toBe(200);
      expect(response.body.data.createBook.id).toBe('100');
      expect(response.body.data.createBook.title).toBe('新しい書籍');
      expect(mockBookRepository.save).toHaveBeenCalledTimes(1);
    });

    it('未認証の場合は書籍を作成できない', async () => {
      const mutation = `
        mutation {
          createBook(input: {
            sheetId: 1
            title: "テスト"
            author: "著者"
            category: "カテゴリ"
            image: ""
            impression: ""
            memo: ""
            isPublicMemo: false
          }) {
            id
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: mutation });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        'Missing authentication headers',
      );
    });
  });

  describe('Mutation: updateBook', () => {
    it('書籍を更新できる', async () => {
      const existingBook = createMockBook({ id: '1', title: '元のタイトル' });
      mockBookRepository.findById.mockResolvedValue(existingBook);
      mockBookRepository.save.mockImplementation((book: Book) =>
        Promise.resolve(book),
      );
      mockSearchRepository.updateDocument.mockResolvedValue(undefined);
      mockBookRepository.findForSearchById.mockResolvedValue({
        id: '1',
        title: '更新後のタイトル',
        author: 'テスト著者',
        image: '',
        memo: '',
        isPublicMemo: false,
        userName: 'user',
        userImage: null,
        sheetName: 'sheet',
      });

      const mutation = `
        mutation {
          updateBook(input: {
            id: "1"
            title: "更新後のタイトル"
          }) {
            id
            title
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set(createAuthHeaders())
        .send({ query: mutation });

      expect(response.status).toBe(200);
      expect(response.body.data.updateBook.title).toBe('更新後のタイトル');
    });
  });

  describe('Mutation: deleteBook', () => {
    it('書籍を削除できる', async () => {
      mockBookRepository.delete.mockResolvedValue(undefined);
      mockSearchRepository.deleteDocument.mockResolvedValue(undefined);

      const mutation = `
        mutation {
          deleteBook(input: { id: "1" })
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set(createAuthHeaders())
        .send({ query: mutation });

      expect(response.status).toBe(200);
      expect(response.body.data.deleteBook).toBe(true);
      expect(mockBookRepository.delete).toHaveBeenCalledWith('1', TEST_USER_ID);
    });
  });
});
