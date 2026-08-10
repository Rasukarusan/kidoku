import { PrismaService } from '../database/prisma.service';
import { BookRepository } from './book';

describe('BookRepository.findForReadingChat', () => {
  it('常にログインユーザーで絞り込み、マスク前のメモをDB検索しない', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const prisma = {
      books: { findMany },
    } as unknown as PrismaService;
    const repository = new BookRepository(prisma);

    await repository.findForReadingChat('current-user', {
      searchText: '非公開キーワード',
      finishedOnly: false,
      includeMemo: true,
      orderBy: 'recent',
      limit: 40,
    });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'current-user' },
        take: 40,
      }),
    );
    const query = findMany.mock.calls[0][0] as {
      where: Record<string, unknown>;
      select: Record<string, unknown>;
    };
    expect(query.where).not.toHaveProperty('OR');
    expect(query.select.memo).toBe(true);
  });

  it('ページの本IDもログインユーザーとのAND条件で取得する', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const prisma = {
      books: { findMany },
    } as unknown as PrismaService;

    await new BookRepository(prisma).findForReadingChat('current-user', {
      ids: [42],
      finishedOnly: false,
      includeMemo: true,
      orderBy: 'recent',
      limit: 1,
    });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'current-user', id: { in: [42] } },
      }),
    );
  });
});
