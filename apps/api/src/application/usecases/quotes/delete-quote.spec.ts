import { NotFoundException } from '@nestjs/common';
import { DeleteQuoteUseCase } from './delete-quote';
import { IQuoteRepository } from '../../../domain/repositories/quote';
import { Quote } from '../../../domain/models/quote';

describe('DeleteQuoteUseCase', () => {
  let useCase: DeleteQuoteUseCase;
  let mockRepo: jest.Mocked<IQuoteRepository>;

  beforeEach(() => {
    mockRepo = {
      findByBookId: jest.fn(),
      findWithBookByUserId: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IQuoteRepository>;

    useCase = new DeleteQuoteUseCase(mockRepo);
  });

  it('存在する引用を削除できる', async () => {
    mockRepo.findById.mockResolvedValue(
      Quote.fromDatabase(
        '1',
        'user-1',
        1,
        null,
        '引用',
        null,
        new Date(),
        new Date(),
      ),
    );

    await useCase.execute(1, 'user-1');

    expect(mockRepo.delete).toHaveBeenCalledWith(1, 'user-1');
  });

  it('存在しない引用はNotFoundException', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(999, 'user-1')).rejects.toThrow(
      NotFoundException,
    );
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });
});
