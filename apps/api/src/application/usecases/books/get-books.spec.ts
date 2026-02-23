import { GetBooksUseCase } from './get-books';
import { IBookRepository } from '../../../domain/repositories/book';
import { Book } from '../../../domain/models/book';

describe('GetBooksUseCase', () => {
  let useCase: GetBooksUseCase;
  let mockBookRepo: jest.Mocked<IBookRepository>;

  beforeEach(() => {
    mockBookRepo = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findBySheetId: jest.fn(),
      findByUserIdAndSheetId: jest.fn(),
      findByUserIdAndSheetName: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findAllForSearch: jest.fn(),
      findForSearchById: jest.fn(),
      getCategories: jest.fn(),
    } as unknown as jest.Mocked<IBookRepository>;

    useCase = new GetBooksUseCase(mockBookRepo);
  });

  const sampleBooks = [
    Book.fromDatabase(
      '1',
      'user-1',
      1,
      '書籍1',
      '著者1',
      'カテゴリ',
      'img1.jpg',
      '★',
      '',
      false,
      false,
      null,
      new Date(),
      new Date(),
    ),
    Book.fromDatabase(
      '2',
      'user-1',
      1,
      '書籍2',
      '著者2',
      'カテゴリ',
      'img2.jpg',
      '★★',
      '',
      false,
      false,
      null,
      new Date(),
      new Date(),
    ),
  ];

  it('ユーザーIDで全書籍を取得できる', async () => {
    mockBookRepo.findByUserId.mockResolvedValue(sampleBooks);

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result).toHaveLength(2);
    expect(mockBookRepo.findByUserId).toHaveBeenCalledWith('user-1');
  });

  it('sheetIdが指定された場合はシートIDで絞り込む', async () => {
    mockBookRepo.findByUserIdAndSheetId.mockResolvedValue([sampleBooks[0]]);

    const result = await useCase.execute({ userId: 'user-1', sheetId: 1 });

    expect(result).toHaveLength(1);
    expect(mockBookRepo.findByUserIdAndSheetId).toHaveBeenCalledWith(
      'user-1',
      1,
    );
  });

  it('sheetNameが指定された場合はシート名で絞り込む', async () => {
    mockBookRepo.findByUserIdAndSheetName.mockResolvedValue(sampleBooks);

    const result = await useCase.execute({
      userId: 'user-1',
      sheetName: 'マイシート',
    });

    expect(result).toHaveLength(2);
    expect(mockBookRepo.findByUserIdAndSheetName).toHaveBeenCalledWith(
      'user-1',
      'マイシート',
    );
  });

  it('sheetIdとsheetNameの両方がある場合はsheetIdが優先される', async () => {
    mockBookRepo.findByUserIdAndSheetId.mockResolvedValue([sampleBooks[0]]);

    await useCase.execute({
      userId: 'user-1',
      sheetId: 1,
      sheetName: 'マイシート',
    });

    expect(mockBookRepo.findByUserIdAndSheetId).toHaveBeenCalled();
    expect(mockBookRepo.findByUserIdAndSheetName).not.toHaveBeenCalled();
  });
});
