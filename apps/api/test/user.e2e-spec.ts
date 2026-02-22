import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { createAuthHeaders, TEST_USER_ID } from './helpers/auth.helper';
import { User } from '../src/domain/models/user';

interface MockUserParams {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  admin?: boolean;
}

function createMockUser(overrides: MockUserParams = {}): User {
  return User.fromDatabase(
    overrides.id ?? TEST_USER_ID,
    overrides.name ?? 'テストユーザー',
    overrides.email ?? 'test@example.com',
    overrides.image ?? 'https://example.com/avatar.jpg',
    overrides.admin ?? false,
  );
}

describe('UserResolver (e2e)', () => {
  let app: INestApplication;
  const mockUserRepository = {
    findById: jest.fn(),
    findByName: jest.fn(),
    updateName: jest.fn(),
    delete: jest.fn(),
  };

  beforeAll(async () => {
    const { app: testApp } = await createTestApp({
      userRepository: mockUserRepository,
    });
    app = testApp;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Query: userImage', () => {
    it('ユーザー名からアバター画像を取得できる（認証不要）', async () => {
      const mockUser = createMockUser({
        name: 'alice',
        image: 'https://example.com/alice.jpg',
      });
      mockUserRepository.findByName.mockResolvedValue(mockUser);

      const query = `
        query {
          userImage(input: { name: "alice" })
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query });

      expect(response.status).toBe(200);
      expect(response.body.data.userImage).toBe(
        'https://example.com/alice.jpg',
      );
    });
  });

  describe('Query: isNameAvailable', () => {
    it('利用可能なユーザー名の場合trueを返す', async () => {
      mockUserRepository.findByName.mockResolvedValue(null);

      const query = `
        query {
          isNameAvailable(input: { name: "newuser" })
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set(createAuthHeaders())
        .send({ query });

      expect(response.status).toBe(200);
      expect(response.body.data.isNameAvailable).toBe(true);
    });

    it('既に使用されているユーザー名の場合falseを返す', async () => {
      mockUserRepository.findByName.mockResolvedValue(
        createMockUser({ name: 'existinguser' }),
      );

      const query = `
        query {
          isNameAvailable(input: { name: "existinguser" })
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set(createAuthHeaders())
        .send({ query });

      expect(response.status).toBe(200);
      expect(response.body.data.isNameAvailable).toBe(false);
    });

    it('未認証の場合はエラーを返す', async () => {
      const query = `
        query {
          isNameAvailable(input: { name: "test" })
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

  describe('Mutation: updateUserName', () => {
    it('ユーザー名を更新できる', async () => {
      const updatedUser = createMockUser({ name: '新しい名前' });
      mockUserRepository.updateName.mockResolvedValue(updatedUser);

      const mutation = `
        mutation {
          updateUserName(input: { name: "新しい名前" }) {
            name
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set(createAuthHeaders())
        .send({ query: mutation });

      expect(response.status).toBe(200);
      expect(response.body.data.updateUserName.name).toBe('新しい名前');
      expect(mockUserRepository.updateName).toHaveBeenCalledWith(
        TEST_USER_ID,
        '新しい名前',
      );
    });

    it('未認証の場合はユーザー名を更新できない', async () => {
      const mutation = `
        mutation {
          updateUserName(input: { name: "test" }) {
            name
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

  describe('Mutation: deleteUser', () => {
    it('ユーザーを削除できる', async () => {
      mockUserRepository.delete.mockResolvedValue(undefined);

      const mutation = `
        mutation {
          deleteUser
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set(createAuthHeaders())
        .send({ query: mutation });

      expect(response.status).toBe(200);
      expect(response.body.data.deleteUser).toBe(true);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(TEST_USER_ID);
    });
  });
});
