import { DeleteTemplateBookUseCase } from './delete-template-book';
import { ITemplateBookRepository } from '../../../domain/repositories/template-book';

describe('DeleteTemplateBookUseCase', () => {
  let useCase: DeleteTemplateBookUseCase;
  let mockRepo: jest.Mocked<ITemplateBookRepository>;

  beforeEach(() => {
    mockRepo = {
      findByUserId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ITemplateBookRepository>;

    useCase = new DeleteTemplateBookUseCase(mockRepo);
  });

  it('テンプレート書籍を削除できる', async () => {
    mockRepo.delete.mockResolvedValue(undefined);

    await useCase.execute(1, 'user-1');

    expect(mockRepo.delete).toHaveBeenCalledWith(1, 'user-1');
  });
});
