import { GetMemoTemplatesUseCase } from './get-memo-templates';
import { IMemoTemplateRepository } from '../../../domain/repositories/memo-template';
import { MemoTemplate } from '../../../domain/models/memo-template';

describe('GetMemoTemplatesUseCase', () => {
  let useCase: GetMemoTemplatesUseCase;
  let mockRepo: jest.Mocked<IMemoTemplateRepository>;

  beforeEach(() => {
    mockRepo = {
      findByUserId: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IMemoTemplateRepository>;

    useCase = new GetMemoTemplatesUseCase(mockRepo);
  });

  it('ユーザーのテンプレート一覧を返す', async () => {
    const templates = [
      MemoTemplate.fromDatabase(
        '1',
        'user-1',
        'デフォルト',
        '内容1',
        true,
        new Date(),
        new Date(),
      ),
      MemoTemplate.fromDatabase(
        '2',
        'user-1',
        'その他',
        '内容2',
        false,
        new Date(),
        new Date(),
      ),
    ];
    mockRepo.findByUserId.mockResolvedValue(templates);

    const result = await useCase.execute('user-1');

    expect(result).toHaveLength(2);
    expect(result[0].isDefault).toBe(true);
    expect(mockRepo.findByUserId).toHaveBeenCalledWith('user-1');
  });
});
