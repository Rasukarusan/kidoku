import { NotFoundException } from '@nestjs/common';
import { DeleteMemoTemplateUseCase } from './delete-memo-template';
import { IMemoTemplateRepository } from '../../../domain/repositories/memo-template';
import { MemoTemplate } from '../../../domain/models/memo-template';

describe('DeleteMemoTemplateUseCase', () => {
  let useCase: DeleteMemoTemplateUseCase;
  let mockRepo: jest.Mocked<IMemoTemplateRepository>;

  beforeEach(() => {
    mockRepo = {
      findByUserId: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IMemoTemplateRepository>;

    useCase = new DeleteMemoTemplateUseCase(mockRepo);
  });

  it('存在するテンプレートを削除できる', async () => {
    mockRepo.findById.mockResolvedValue(
      MemoTemplate.fromDatabase(
        '1',
        'user-1',
        '名前',
        '内容',
        false,
        new Date(),
        new Date(),
      ),
    );

    await useCase.execute(1, 'user-1');

    expect(mockRepo.delete).toHaveBeenCalledWith(1, 'user-1');
  });

  it('存在しないテンプレートはNotFoundException', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(999, 'user-1')).rejects.toThrow(
      NotFoundException,
    );
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });
});
