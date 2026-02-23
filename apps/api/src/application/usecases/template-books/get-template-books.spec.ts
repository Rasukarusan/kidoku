import { GetTemplateBooksUseCase } from './get-template-books';
import { ITemplateBookRepository } from '../../../domain/repositories/template-book';
import { TemplateBook } from '../../../domain/models/template-book';

describe('GetTemplateBooksUseCase', () => {
  let useCase: GetTemplateBooksUseCase;
  let mockRepo: jest.Mocked<ITemplateBookRepository>;

  beforeEach(() => {
    mockRepo = {
      findByUserId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ITemplateBookRepository>;

    useCase = new GetTemplateBooksUseCase(mockRepo);
  });

  it('ユーザーのテンプレート書籍一覧を取得できる', async () => {
    const templates = [
      TemplateBook.fromDatabase(
        '1',
        'user-1',
        'テンプレ1',
        'タイトル1',
        '著者1',
        'カテゴリ1',
        'img1.jpg',
        'メモ1',
        false,
        new Date(),
        new Date(),
      ),
    ];
    mockRepo.findByUserId.mockResolvedValue(templates);

    const result = await useCase.execute('user-1');

    expect(result).toHaveLength(1);
    expect(mockRepo.findByUserId).toHaveBeenCalledWith('user-1');
  });

  it('テンプレートが存在しない場合は空配列を返す', async () => {
    mockRepo.findByUserId.mockResolvedValue([]);

    const result = await useCase.execute('user-1');

    expect(result).toEqual([]);
  });
});
