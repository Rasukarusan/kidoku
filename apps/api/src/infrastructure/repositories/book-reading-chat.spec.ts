import { PrismaService } from '../database/prisma.service';
import { BookRepository } from './book';
import { readBooks } from '@kidoku/reading-store';

jest.mock('@kidoku/reading-store', () => ({
  readBooks: jest.fn().mockResolvedValue([]),
}));
const read = jest.mocked(readBooks);

describe('BookRepository.findForReadingChat', () => {
  beforeEach(() => jest.clearAllMocks());

  it('マスク前のメモを検索条件に含めない', async () => {
    const prisma = {} as PrismaService;
    await new BookRepository(prisma).findForReadingChat('current-user', {
      searchText: '非公開キーワード',
      finishedOnly: false,
      includeMemo: true,
      orderBy: 'recent',
      limit: 40,
    });
    expect(read.mock.calls[0][0]).toBe(prisma);
    expect(read.mock.calls[0][1]).toMatchObject({
      filter: { userId: 'current-user' },
      limit: 40,
    });
    expect(read.mock.calls[0][1]?.filter).not.toHaveProperty('search');
  });

  it('ページの本IDもログインユーザーとのAND条件で取得する', async () => {
    const prisma = {} as PrismaService;
    await new BookRepository(prisma).findForReadingChat('current-user', {
      ids: [42],
      finishedOnly: false,
      includeMemo: true,
      orderBy: 'recent',
      limit: 1,
    });
    expect(read.mock.calls[0][0]).toBe(prisma);
    expect(read.mock.calls[0][1]?.filter).toMatchObject({
      userId: 'current-user',
      id: [42],
    });
  });
});
