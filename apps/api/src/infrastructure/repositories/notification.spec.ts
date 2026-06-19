import { NotificationRepository } from './notification';
import { PrismaService } from '../database/prisma.service';

describe('NotificationRepository', () => {
  let repository: NotificationRepository;
  let prisma: {
    notification: {
      upsert: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      notification: {
        upsert: jest.fn(),
        create: jest.fn(),
      },
    };
    repository = new NotificationRepository(prisma as unknown as PrismaService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('自分自身の操作では通知を作成しない', async () => {
    await repository.create({
      userId: 'same',
      actorId: 'same',
      type: 'like',
      bookId: 1,
    });

    expect(prisma.notification.upsert).not.toHaveBeenCalled();
    expect(prisma.notification.create).not.toHaveBeenCalled();
  });

  it('いいね通知は (受信者・操作者・種別・本) で upsert し重複作成しない', async () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    jest.useFakeTimers().setSystemTime(now);

    await repository.create({
      userId: 'owner',
      actorId: 'liker',
      type: 'like',
      bookId: 1,
    });

    expect(prisma.notification.create).not.toHaveBeenCalled();
    expect(prisma.notification.upsert).toHaveBeenCalledWith({
      where: {
        userId_actorId_type_bookId: {
          userId: 'owner',
          actorId: 'liker',
          type: 'like',
          bookId: 1,
        },
      },
      create: {
        userId: 'owner',
        actorId: 'liker',
        type: 'like',
        bookId: 1,
      },
      update: { read: false, created: now },
    });
  });

  it('本に紐づかない通知（フォロー等）は通常作成する', async () => {
    await repository.create({
      userId: 'followed',
      actorId: 'follower',
      type: 'follow',
    });

    expect(prisma.notification.upsert).not.toHaveBeenCalled();
    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: {
        userId: 'followed',
        actorId: 'follower',
        type: 'follow',
        bookId: null,
      },
    });
  });
});
