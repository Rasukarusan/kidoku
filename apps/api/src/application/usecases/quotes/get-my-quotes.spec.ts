import { GetMyQuotesUseCase } from './get-my-quotes';
import { IQuoteRepository } from '../../../domain/repositories/quote';

describe('GetMyQuotesUseCase', () => {
  let useCase: GetMyQuotesUseCase;
  let mockRepo: jest.Mocked<IQuoteRepository>;

  beforeEach(() => {
    mockRepo = {
      findByBookId: jest.fn(),
      findWithBookByUserId: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IQuoteRepository>;

    useCase = new GetMyQuotesUseCase(mockRepo);
  });

  it('書籍情報付きの引用一覧を返す', async () => {
    mockRepo.findWithBookByUserId.mockResolvedValue([
      {
        id: 1,
        bookId: 2,
        page: 10,
        text: '引用文',
        comment: null,
        created: new Date(),
        bookTitle: 'テスト本',
        bookAuthor: '著者',
        bookImage: 'image.jpg',
      },
    ]);

    const result = await useCase.execute('user-1');

    expect(result).toHaveLength(1);
    expect(result[0].bookTitle).toBe('テスト本');
    expect(mockRepo.findWithBookByUserId).toHaveBeenCalledWith('user-1');
  });
});
