import { MeiliSearch } from 'meilisearch';
import { SearchRepository } from './search';

it('treats an absent search index as already deleted', async () => {
  const client = {
    index: jest.fn().mockReturnValue({
      deleteDocument: jest.fn().mockResolvedValue({ taskUid: 1 }),
    }),
    waitForTask: jest.fn().mockResolvedValue({
      status: 'failed',
      error: { code: 'index_not_found' },
    }),
  };
  await expect(
    new SearchRepository(client as unknown as MeiliSearch).deleteDocument('99'),
  ).resolves.toBeUndefined();
});

it('does not hide authentication errors while invalidating private search data', async () => {
  const error = { code: 'invalid_api_key' };
  const client = {
    index: jest
      .fn()
      .mockReturnValue({ deleteDocument: jest.fn().mockRejectedValue(error) }),
  };
  await expect(
    new SearchRepository(client as unknown as MeiliSearch).deleteDocument('99'),
  ).rejects.toBe(error);
});
