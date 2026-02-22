import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/app.helper';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const { app: testApp } = await createTestApp();
    app = testApp;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GraphQLエンドポイントが応答する', async () => {
    const query = `
      query {
        __schema {
          queryType {
            name
          }
        }
      }
    `;

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query });

    expect(response.status).toBe(200);
    expect(response.body.data.__schema.queryType.name).toBe('Query');
  });
});
