import { NotFoundException } from '@nestjs/common';
import { CreateQuoteUseCase } from './create-quote';
import { IQuoteRepository } from '../../../domain/repositories/quote';
import { IBookRepository } from '../../../domain/repositories/book';
import { Quote } from '../../../domain/models/quote';
import { Book } from '../../../domain/models/book';

describe('CreateQuoteUseCase', () => {
  let useCase: CreateQuoteUseCase;
  let mockQuoteRepo: jest.Mocked<IQuoteRepository>;
  let mockBookRepo: jest.Mocked<IBookRepository>;

  beforeEach(() => {
    mockQuoteRepo = {
      findByBookId: jest.fn(),
      findWithBookByUserId: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IQuoteRepository>;
    mockBookRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<IBookRepository>;

    useCase = new CreateQuoteUseCase(mockQuoteRepo, mockBookRepo);
  });

  it('自分の本に引用を作成できる', async () => {
    mockBookRepo.findById.mockResolvedValue({
      userId: 'user-1',
    } as unknown as Book);
    const saved = Quote.fromDatabase(
      '1',
      'user-1',
      1,
      42,
      '引用文',
      null,
      new Date(),
      new Date(),
    );
    mockQuoteRepo.save.mockResolvedValue(saved);

    const result = await useCase.execute({
      userId: 'user-1',
      bookId: 1,
      page: 42,
      text: '引用文',
      comment: null,
    });

    expect(result.text).toBe('引用文');
    expect(mockQuoteRepo.save).toHaveBeenCalled();
  });

  it('他人の本にはNotFoundException', async () => {
    mockBookRepo.findById.mockResolvedValue({
      userId: 'other-user',
    } as unknown as Book);

    await expect(
      useCase.execute({
        userId: 'user-1',
        bookId: 1,
        page: null,
        text: '引用文',
        comment: null,
      }),
    ).rejects.toThrow(NotFoundException);
    expect(mockQuoteRepo.save).not.toHaveBeenCalled();
  });

  it('存在しない本にはNotFoundException', async () => {
    mockBookRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'user-1',
        bookId: 999,
        page: null,
        text: '引用文',
        comment: null,
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
