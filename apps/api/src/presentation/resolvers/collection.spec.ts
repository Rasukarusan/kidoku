import { Test } from '@nestjs/testing';
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from '@nestjs/graphql';
import { parse, validate } from 'graphql';
import { CollectionResolver } from './collection';

it('builds the generic GraphQL contract for attributes, multiple memberships and histories', async () => {
  const module = await Test.createTestingModule({
    imports: [GraphQLSchemaBuilderModule],
  }).compile();
  try {
    const schema = await module
      .get(GraphQLSchemaFactory)
      .create([CollectionResolver]);
    expect(
      validate(
        schema,
        parse(`
      mutation Save($input: SaveItemInput!) {
        saveItem(input: $input) { id itemTypeId attributes attributesVersion collectionIds logs { id kind occurredAt memo rating } }
      }
      query Workspace { collections { id name itemCount } itemTypes { key schemaVersion definition } items { id itemTypeId } }
    `),
      ),
    ).toEqual([]);
  } finally {
    await module.close();
  }
});
