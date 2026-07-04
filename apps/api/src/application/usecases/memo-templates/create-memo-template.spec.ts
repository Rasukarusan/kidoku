import { CreateMemoTemplateUseCase } from './create-memo-template';
import { IMemoTemplateRepository } from '../../../domain/repositories/memo-template';
import { MemoTemplate } from '../../../domain/models/memo-template';

describe('CreateMemoTemplateUseCase', () => {
  let useCase: CreateMemoTemplateUseCase;
  let mockRepo: jest.Mocked<IMemoTemplateRepository>;

  beforeEach(() => {
    mockRepo = {
      findByUserId: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IMemoTemplateRepository>;

    useCase = new CreateMemoTemplateUseCase(mockRepo);
  });

  it('メモテンプレートを作成して保存する', async () => {
    const saved = MemoTemplate.fromDatabase(
      '1',
      'user-1',
      '読書メモ',
      '【学び】\n',
      false,
      new Date(),
      new Date(),
    );
    mockRepo.save.mockResolvedValue(saved);

    const result = await useCase.execute({
      userId: 'user-1',
      name: '読書メモ',
      content: '【学び】\n',
      isDefault: false,
    });

    expect(result.name).toBe('読書メモ');
    expect(result.content).toBe('【学び】\n');
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it('バリデーションエラーは保存せずに投げる', async () => {
    await expect(
      useCase.execute({
        userId: 'user-1',
        name: '',
        content: '内容',
        isDefault: false,
      }),
    ).rejects.toThrow('テンプレート名は必須です');
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
