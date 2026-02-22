import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { Comment } from '../src/domain/models/comment';

const now = new Date('2025-01-01T00:00:00.000Z');

interface MockCommentParams {
  bookId?: string;
  bookTitle?: string;
  bookMemo?: string;
  bookImage?: string;
  bookUpdated?: Date;
  username?: string;
  userImage?: string | null;
  sheetId?: string;
}

function createMockComment(overrides: MockCommentParams = {}): Comment {
  return Comment.fromDatabase(
    overrides.bookId ?? '1',
    overrides.bookTitle ?? 'テスト書籍',
    overrides.bookMemo ?? '公開メモ内容',
    overrides.bookImage ?? 'https://example.com/image.jpg',
    overrides.bookUpdated ?? now,
    overrides.username ?? 'テストユーザー',
    overrides.userImage ?? 'https://example.com/avatar.jpg',
    overrides.sheetId ?? '1',
  );
}

describe('CommentResolver (e2e)', () => {
  let app: INestApplication;
  const mockCommentRepository = {
    findPublicComments: jest.fn(),
  };

  beforeAll(async () => {
    const { app: testApp } = await createTestApp({
      commentRepository: mockCommentRepository,
    });
    app = testApp;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Query: comments', () => {
    it('公開コメント一覧を取得できる（認証不要）', async () => {
      const mockComments = [
        createMockComment({ bookId: '1', bookTitle: '書籍A' }),
        createMockComment({ bookId: '2', bookTitle: '書籍B' }),
      ];
      mockCommentRepository.findPublicComments.mockResolvedValue({
        items: mockComments,
        total: 2,
        hasMore: false,
      });

      const query = `
        query {
          comments(input: { limit: 10, offset: 0 }) {
            comments {
              id
              title
              memo
              username
            }
            total
            hasMore
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query });

      expect(response.status).toBe(200);
      expect(response.body.data.comments.comments).toHaveLength(2);
      expect(response.body.data.comments.total).toBe(2);
      expect(response.body.data.comments.hasMore).toBe(false);
      expect(response.body.data.comments.comments[0].title).toBe('書籍A');
    });

    it('ページネーションが正しく動作する', async () => {
      mockCommentRepository.findPublicComments.mockResolvedValue({
        items: [createMockComment()],
        total: 15,
        hasMore: true,
      });

      const query = `
        query {
          comments(input: { limit: 5, offset: 0 }) {
            comments {
              id
            }
            total
            hasMore
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query });

      expect(response.status).toBe(200);
      expect(response.body.data.comments.total).toBe(15);
      expect(response.body.data.comments.hasMore).toBe(true);
      expect(mockCommentRepository.findPublicComments).toHaveBeenCalledWith(
        5,
        0,
      );
    });

    it('コメントが0件の場合は空配列を返す', async () => {
      mockCommentRepository.findPublicComments.mockResolvedValue({
        items: [],
        total: 0,
        hasMore: false,
      });

      const query = `
        query {
          comments(input: { limit: 10, offset: 0 }) {
            comments {
              id
            }
            total
            hasMore
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query });

      expect(response.status).toBe(200);
      expect(response.body.data.comments.comments).toHaveLength(0);
      expect(response.body.data.comments.total).toBe(0);
    });
  });
});
