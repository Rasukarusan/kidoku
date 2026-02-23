import { GetSheetsUseCase } from './get-sheets';
import { ISheetRepository } from '../../../domain/repositories/sheet';
import { Sheet } from '../../../domain/models/sheet';

describe('GetSheetsUseCase', () => {
  let useCase: GetSheetsUseCase;
  let mockSheetRepo: jest.Mocked<ISheetRepository>;

  beforeEach(() => {
    mockSheetRepo = {
      findByUserId: jest.fn(),
      findById: jest.fn(),
      findLastByUserId: jest.fn(),
      findByUserIdAndName: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      saveAll: jest.fn(),
    } as unknown as jest.Mocked<ISheetRepository>;

    useCase = new GetSheetsUseCase(mockSheetRepo);
  });

  it('ユーザーのシート一覧を取得できる', async () => {
    const sheets = [
      Sheet.fromDatabase('1', 'user-1', '2025', 1, new Date(), new Date()),
      Sheet.fromDatabase('2', 'user-1', '2024', 2, new Date(), new Date()),
    ];
    mockSheetRepo.findByUserId.mockResolvedValue(sheets);

    const result = await useCase.execute('user-1');

    expect(result).toHaveLength(2);
    expect(mockSheetRepo.findByUserId).toHaveBeenCalledWith('user-1');
  });

  it('シートが存在しない場合は空配列を返す', async () => {
    mockSheetRepo.findByUserId.mockResolvedValue([]);

    const result = await useCase.execute('user-1');

    expect(result).toEqual([]);
  });
});
