import { NotFoundException } from '@nestjs/common';
import { UpdateMemoTemplateUseCase } from './update-memo-template';
import { IMemoTemplateRepository } from '../../../domain/repositories/memo-template';
import { MemoTemplate } from '../../../domain/models/memo-template';

describe('UpdateMemoTemplateUseCase', () => {
  let useCase: UpdateMemoTemplateUseCase;
  let mockRepo: jest.Mocked<IMemoTemplateRepository>;

  beforeEach(() => {
    mockRepo = {
      findByUserId: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IMemoTemplateRepository>;

    useCase = new UpdateMemoTemplateUseCase(mockRepo);
  });

  it('既存テンプレートを更新して保存する', async () => {
    const existing = MemoTemplate.fromDatabase(
      '1',
      'user-1',
      '旧名',
      '旧内容',
      false,
      new Date(),
      new Date(),
    );
    mockRepo.findById.mockResolvedValue(existing);
    mockRepo.save.mockImplementation((t) => Promise.resolve(t));

    const result = await useCase.execute({
      id: 1,
      userId: 'user-1',
      name: '新名',
      content: '新内容',
      isDefault: true,
    });

    expect(result.name).toBe('新名');
    expect(result.content).toBe('新内容');
    expect(result.isDefault).toBe(true);
    expect(mockRepo.findById).toHaveBeenCalledWith(1, 'user-1');
    expect(mockRepo.save).toHaveBeenCalledWith(existing);
  });

  it('存在しないテンプレートはNotFoundException', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        id: 999,
        userId: 'user-1',
        name: '名前',
        content: '内容',
        isDefault: false,
      }),
    ).rejects.toThrow(NotFoundException);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
