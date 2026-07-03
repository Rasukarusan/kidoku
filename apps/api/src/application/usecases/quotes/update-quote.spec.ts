import { NotFoundException } from '@nestjs/common';
import { UpdateQuoteUseCase } from './update-quote';
import { IQuoteRepository } from '../../../domain/repositories/quote';
import { Quote } from '../../../domain/models/quote';

describe('UpdateQuoteUseCase', () => {
  let useCase: UpdateQuoteUseCase;
  let mockRepo: jest.Mocked<IQuoteRepository>;

  beforeEach(() => {
    mockRepo = {
      findByBookId: jest.fn(),
      findWithBookByUserId: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IQuoteRepository>;

    useCase = new UpdateQuoteUseCase(mockRepo);
  });

  it('既存の引用を更新できる', async () => {
    const existing = Quote.fromDatabase(
      '1',
      'user-1',
      1,
      10,
      '旧引用',
      null,
      new Date(),
      new Date(),
    );
    mockRepo.findById.mockResolvedValue(existing);
    mockRepo.save.mockImplementation((q) => Promise.resolve(q));

    const result = await useCase.execute({
      id: 1,
      userId: 'user-1',
      page: 20,
      text: '新引用',
      comment: 'メモ',
    });

    expect(result.text).toBe('新引用');
    expect(result.page).toBe(20);
    expect(mockRepo.findById).toHaveBeenCalledWith(1, 'user-1');
  });

  it('存在しない引用はNotFoundException', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        id: 999,
        userId: 'user-1',
        page: null,
        text: '引用',
        comment: null,
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
