import { SaveItemInput, SaveLogInput } from './domain/models/item';
import { Test } from '@nestjs/testing';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import { AppModule } from './app.module';
import { PrismaService } from './infrastructure/database/prisma.service';
import { INJECTION_TOKENS } from './shared/constants/injection-tokens';
import { ICollectionRepository } from './domain/repositories/collection';
import { createHmac } from 'crypto';
import { graphql } from 'graphql';

it('boots the API with the collection module and publishes its GraphQL contract', async () => {
  process.env.NEXTAUTH_SECRET ||= 'collection-startup-test-secret';
  const repository = {
    types: jest.fn().mockResolvedValue([
      {
        key: 'movie',
        name: '映画',
        schemaVersion: 1,
        definition: {
          fields: [{ key: 'directors', label: '監督', type: 'textList' }],
          logKinds: [{ key: 'watched', label: '鑑賞', dateLabel: '鑑賞日' }],
          itemUnit: '作品',
        },
      },
    ]),
    saveItem: jest.fn(
      (
        userId: string,
        _id: number | undefined,
        input: SaveItemInput,
        version: number,
        log: SaveLogInput | undefined,
      ) =>
        Promise.resolve({
          ...input,
          id: 99,
          userId,
          attributesVersion: version,
          logs: [{ ...log, id: 1, itemId: 99 }],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
    ),
    items: jest.fn(),
  };
  const module = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService)
    .useValue({ onModuleInit: jest.fn(), onModuleDestroy: jest.fn() })
    .overrideProvider(INJECTION_TOKENS.MEILISEARCH)
    .useValue({ index: jest.fn() })
    .overrideProvider(ICollectionRepository)
    .useValue(repository)
    .compile();
  const app = module.createNestApplication();
  try {
    await app.init();
    const schema = module.get(GraphQLSchemaHost).schema;
    expect(schema.getQueryType()?.getFields()).toHaveProperty('items');
    expect(schema.getMutationType()?.getFields()).toHaveProperty('saveItemLog');
    expect(schema.getQueryType()?.getFields()).toHaveProperty('books');
    const timestamp = Date.now().toString();
    const signature = createHmac('sha256', process.env.NEXTAUTH_SECRET)
      .update(`owner:false:${timestamp}`)
      .digest('hex');
    const result = await graphql({
      schema,
      source:
        'mutation Save($input: SaveItemInput!) { saveItem(input: $input) { id attributes collectionIds logs { kind occurredAt } } }',
      variableValues: {
        input: {
          itemTypeId: 'movie',
          title: '映画',
          attributes: { directors: ['監督'] },
          collectionIds: [10, 20],
          initialLog: {
            kind: 'watched',
            occurredAt: '2026-01-01T00:00:00.000Z',
          },
        },
      },
      contextValue: {
        req: {
          headers: {
            'x-user-id': 'owner',
            'x-user-admin': 'false',
            'x-timestamp': timestamp,
            'x-signature': signature,
          },
        },
      },
    });
    expect(result.errors).toBeUndefined();
    expect(result.data).toMatchObject({
      saveItem: {
        id: 99,
        attributes: { directors: ['監督'] },
        collectionIds: [10, 20],
        logs: [{ kind: 'watched' }],
      },
    });
    expect(repository.saveItem).toHaveBeenCalledWith(
      'owner',
      undefined,
      expect.objectContaining({ itemTypeId: 'movie', collectionIds: [10, 20] }),
      1,
      expect.objectContaining({
        kind: 'watched',
        occurredAt: new Date('2026-01-01'),
      }),
    );
    const denied = await graphql({
      schema,
      source: '{ items { id } }',
      contextValue: { req: { headers: {} } },
    });
    expect(denied.errors).toBeDefined();
    expect(repository.items).not.toHaveBeenCalled();
  } finally {
    await app.close();
  }
});
