import { ManageCollectionsUseCase } from './manage-collections';
import { ICollectionRepository } from '../../../domain/repositories/collection';
import { ISearchRepository } from '../../../domain/repositories/search';
import { IUserRepository } from '../../../domain/repositories/user';
import { User } from '../../../domain/models/user';

const type = {
  key: 'movie',
  name: '映画',
  schemaVersion: 1,
  definition: {
    fields: [],
    logKinds: [{ key: 'watched', label: '鑑賞', dateLabel: '鑑賞日' }],
    itemUnit: '作品',
  },
};
function setup() {
  const repository = {
    types: jest.fn().mockResolvedValue([type]),
    item: jest.fn(),
    saveItem: jest.fn(),
    saveLog: jest.fn(),
    collections: jest.fn(),
  };
  return {
    repository,
    useCase: new ManageCollectionsUseCase(
      repository as unknown as ICollectionRepository,
    ),
  };
}
const input = {
  itemTypeId: 'movie',
  title: '映画',
  imageUrl: '/no-image.png',
  category: '',
  rating: '-',
  memo: '',
  isPublicMemo: false,
  attributes: {},
  collectionIds: [1, 1],
};

describe('collection item use cases', () => {
  it('invalidates a public search projection before making a memo private', async () => {
    const { repository } = setup();
    repository.types.mockResolvedValue([{ ...type, key: 'book' }]);
    const value = {
      ...input,
      id: 10,
      userId: 'owner',
      itemTypeId: 'book',
      collectionIds: [1],
      attributesVersion: 1,
      memo: '非公開の新しいメモ',
      logs: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    repository.item.mockResolvedValue({ ...value, isPublicMemo: true });
    repository.saveItem.mockResolvedValue(value);
    repository.collections.mockResolvedValue([{ id: 1, name: '本棚' }]);
    const search = { deleteDocument: jest.fn(), updateDocument: jest.fn() };
    const users = {
      findById: jest
        .fn()
        .mockResolvedValue(
          User.fromDatabase('owner', 'owner', null, null, false),
        ),
    };
    const useCase = new ManageCollectionsUseCase(
      repository as unknown as ICollectionRepository,
      search as unknown as ISearchRepository,
      users as unknown as IUserRepository,
    );
    await useCase.saveItem('owner', 10, {
      ...input,
      itemTypeId: 'book',
      memo: '非公開の新しいメモ',
    });
    expect(search.deleteDocument.mock.invocationCallOrder[0]).toBeLessThan(
      repository.saveItem.mock.invocationCallOrder[0],
    );
    expect(search.updateDocument.mock.calls[0][0]).toMatchObject({ memo: '' });
  });
  it('deduplicates memberships and commits an initial viewing log with the item', async () => {
    const { useCase, repository } = setup();
    const log = {
      kind: 'watched',
      occurredAt: new Date('2026-01-01'),
      memo: '',
      rating: null,
    };
    await useCase.saveItem('owner', undefined, input, log);
    expect(repository.saveItem).toHaveBeenCalledWith(
      'owner',
      undefined,
      { ...input, collectionIds: [1] },
      1,
      log,
    );
  });
  it('cannot convert an existing book into a movie', async () => {
    const { useCase, repository } = setup();
    repository.item.mockResolvedValue({
      itemTypeId: 'book',
      attributesVersion: 1,
    });
    await expect(useCase.saveItem('owner', 10, input)).rejects.toThrow(
      '種類は変更できません',
    );
    expect(repository.saveItem).not.toHaveBeenCalled();
  });
  it('requires an attribute migration before overwriting an old schema', async () => {
    const { useCase, repository } = setup();
    repository.item.mockResolvedValue({
      itemTypeId: 'movie',
      attributesVersion: 0,
    });
    await expect(useCase.saveItem('owner', 10, input)).rejects.toThrow(
      'バージョン更新',
    );
  });
  it('never returns another user item when lookup is not authorized', async () => {
    const { useCase, repository } = setup();
    repository.item.mockResolvedValue(null);
    await expect(useCase.item('intruder', 10)).rejects.toThrow(
      '見つかりません',
    );
    expect(repository.item).toHaveBeenCalledWith('intruder', 10);
  });
});
