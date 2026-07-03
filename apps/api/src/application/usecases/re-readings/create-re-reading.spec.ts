import { NotFoundException } from '@nestjs/common';
import { CreateReReadingUseCase } from './create-re-reading';
import { IReReadingRepository } from '../../../domain/repositories/re-reading';
import { IBookRepository } from '../../../domain/repositories/book';
import { ReReading } from '../../../domain/models/re-reading';
import { Book } from '../../../domain/models/book';

describe('CreateReReadingUseCase', () => {
  let useCase: CreateReReadingUseCase;
  let mockRepo: jest.Mocked<IReReadingRepository>;
  let mockBookRepo: jest.Mocked<IBookRepository>;

  beforeEach(() => {
    mockRepo = {
      findByBookId: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IReReadingRepository>;
    mockBookRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<IBookRepository>;

    useCase = new CreateReReadingUseCase(mockRepo, mockBookRepo);
  });

  it('自分の本に再読記録を作成できる', async () => {
    mockBookRepo.findById.mockResolvedValue({
      userId: 'user-1',
    } as unknown as Book);
    const finished = new Date('2026-01-15');
    mockRepo.save.mockResolvedValue(
      ReReading.fromDatabase('1', 'user-1', 1, finished, null, new Date()),
    );

    const result = await useCase.execute({
      userId: 'user-1',
      bookId: 1,
      finished,
      memo: null,
    });

    expect(result.finished).toBe(finished);
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it('他人の本にはNotFoundException', async () => {
    mockBookRepo.findById.mockResolvedValue({
      userId: 'other',
    } as unknown as Book);

    await expect(
      useCase.execute({
        userId: 'user-1',
        bookId: 1,
        finished: new Date(),
        memo: null,
      }),
    ).rejects.toThrow(NotFoundException);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
