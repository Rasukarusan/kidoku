import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { createAuthHeaders, TEST_USER_ID } from './helpers/auth.helper';
import { Sheet } from '../src/domain/models/sheet';

const now = new Date('2025-01-01T00:00:00.000Z');

interface MockSheetParams {
  id?: string;
  userId?: string;
  name?: string;
  order?: number;
  created?: Date;
  updated?: Date;
}

function createMockSheet(overrides: MockSheetParams = {}): Sheet {
  return Sheet.fromDatabase(
    overrides.id ?? '1',
    overrides.userId ?? TEST_USER_ID,
    overrides.name ?? 'テストシート',
    overrides.order ?? 0,
    overrides.created ?? now,
    overrides.updated ?? now,
  );
}

describe('SheetResolver (e2e)', () => {
  let app: INestApplication;
  const mockSheetRepository = {
    findByUserId: jest.fn(),
    findById: jest.fn(),
    findLastByUserId: jest.fn(),
    findByUserIdAndName: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    saveAll: jest.fn(),
  };

  beforeAll(async () => {
    const { app: testApp } = await createTestApp({
      sheetRepository: mockSheetRepository,
    });
    app = testApp;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Query: sheets', () => {
    it('認証済みユーザーがシート一覧を取得できる', async () => {
      const mockSheets = [
        createMockSheet({ id: '1', name: '技術書', order: 1 }),
        createMockSheet({ id: '2', name: '小説', order: 0 }),
      ];
      mockSheetRepository.findByUserId.mockResolvedValue(mockSheets);

      const query = `
        query {
          sheets {
            id
            name
            order
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set(createAuthHeaders())
        .send({ query });

      expect(response.status).toBe(200);
      expect(response.body.data.sheets).toHaveLength(2);
      expect(response.body.data.sheets[0].name).toBe('技術書');
      expect(response.body.data.sheets[1].name).toBe('小説');
    });

    it('未認証の場合はエラーを返す', async () => {
      const query = `
        query {
          sheets {
            id
            name
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        'Missing authentication headers',
      );
    });
  });

  describe('Mutation: createSheet', () => {
    it('新しいシートを作成できる', async () => {
      mockSheetRepository.findLastByUserId.mockResolvedValue(
        createMockSheet({ order: 2 }),
      );
      mockSheetRepository.save.mockImplementation((sheet: Sheet) =>
        Promise.resolve(
          Sheet.fromDatabase(
            '10',
            sheet.userId,
            sheet.name,
            sheet.order,
            now,
            now,
          ),
        ),
      );

      const mutation = `
        mutation {
          createSheet(input: { name: "新しいシート" }) {
            id
            name
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set(createAuthHeaders())
        .send({ query: mutation });

      expect(response.status).toBe(200);
      expect(response.body.data.createSheet.name).toBe('新しいシート');
      expect(mockSheetRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('Mutation: updateSheet', () => {
    it('シート名を更新できる', async () => {
      const existingSheet = createMockSheet({ id: '1', name: '元の名前' });
      mockSheetRepository.findById.mockResolvedValue(existingSheet);
      mockSheetRepository.save.mockImplementation((sheet: Sheet) =>
        Promise.resolve(sheet),
      );

      const mutation = `
        mutation {
          updateSheet(input: { id: "1", name: "更新後の名前" }) {
            id
            name
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set(createAuthHeaders())
        .send({ query: mutation });

      expect(response.status).toBe(200);
      expect(response.body.data.updateSheet.name).toBe('更新後の名前');
    });
  });

  describe('Mutation: deleteSheet', () => {
    it('シートを削除できる', async () => {
      mockSheetRepository.findById.mockResolvedValue(
        createMockSheet({ id: '1' }),
      );
      mockSheetRepository.delete.mockResolvedValue(undefined);

      const mutation = `
        mutation {
          deleteSheet(input: { id: "1" })
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set(createAuthHeaders())
        .send({ query: mutation });

      expect(response.status).toBe(200);
      expect(response.body.data.deleteSheet).toBe(true);
    });
  });

  describe('Mutation: updateSheetOrders', () => {
    it('シートの順序を更新できる', async () => {
      const sheets = [
        createMockSheet({ id: '1', order: 0 }),
        createMockSheet({ id: '2', order: 1 }),
      ];
      mockSheetRepository.findByUserId.mockResolvedValue(sheets);
      mockSheetRepository.saveAll.mockResolvedValue(undefined);

      const mutation = `
        mutation {
          updateSheetOrders(input: {
            sheets: [
              { id: "1", order: 1 },
              { id: "2", order: 0 }
            ]
          })
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set(createAuthHeaders())
        .send({ query: mutation });

      expect(response.status).toBe(200);
      expect(response.body.data.updateSheetOrders).toBe(true);
    });
  });
});
