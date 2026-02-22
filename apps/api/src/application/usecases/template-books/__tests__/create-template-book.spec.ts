import { CreateTemplateBookUseCase } from '../create-template-book';
import { ITemplateBookRepository } from '../../../../domain/repositories/template-book';
import { TemplateBook } from '../../../../domain/models/template-book';

describe('CreateTemplateBookUseCase', () => {
  let useCase: CreateTemplateBookUseCase;
  let mockRepo: jest.Mocked<ITemplateBookRepository>;

  beforeEach(() => {
    mockRepo = {
      findByUserId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ITemplateBookRepository>;

    useCase = new CreateTemplateBookUseCase(mockRepo);
  });

  it('テンプレートブックを作成して保存する', async () => {
    const params = {
      userId: 'user-1',
      name: 'テンプレート名',
      title: 'テスト書籍',
      author: '著者',
      category: 'カテゴリ',
      image: 'image.jpg',
      memo: 'メモ',
      isPublicMemo: false,
    };

    const saved = TemplateBook.fromDatabase(
      '1',
      'user-1',
      'テンプレート名',
      'テスト書籍',
      '著者',
      'カテゴリ',
      'image.jpg',
      'メモ',
      false,
      new Date(),
      new Date(),
    );
    mockRepo.save.mockResolvedValue(saved);

    const result = await useCase.execute(params);

    expect(result.name).toBe('テンプレート名');
    expect(result.title).toBe('テスト書籍');
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
