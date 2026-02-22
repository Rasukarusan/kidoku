import { CreateSheetUseCase } from './create-sheet';
import { ISheetRepository } from '../../../domain/repositories/sheet';
import { Sheet } from '../../../domain/models/sheet';

describe('CreateSheetUseCase', () => {
  let useCase: CreateSheetUseCase;
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

    useCase = new CreateSheetUseCase(mockSheetRepo);
  });

  it('既存シートがない場合order=1でシートを作成する', async () => {
    mockSheetRepo.findLastByUserId.mockResolvedValue(null);
    mockSheetRepo.save.mockImplementation((sheet) => {
      return Promise.resolve(
        Sheet.fromDatabase(
          '1',
          sheet.userId,
          sheet.name,
          sheet.order,
          new Date(),
          new Date(),
        ),
      );
    });

    const result = await useCase.execute('user-1', '新しいシート');

    expect(result.name).toBe('新しいシート');
    expect(result.order).toBe(1);
    expect(mockSheetRepo.save).toHaveBeenCalled();
  });

  it('既存シートがある場合は最後のorder+1でシートを作成する', async () => {
    const lastSheet = Sheet.fromDatabase(
      '3',
      'user-1',
      '既存シート',
      5,
      new Date(),
      new Date(),
    );
    mockSheetRepo.findLastByUserId.mockResolvedValue(lastSheet);
    mockSheetRepo.save.mockImplementation((sheet) => {
      return Promise.resolve(
        Sheet.fromDatabase(
          '4',
          sheet.userId,
          sheet.name,
          sheet.order,
          new Date(),
          new Date(),
        ),
      );
    });

    const result = await useCase.execute('user-1', '新しいシート');

    expect(result.order).toBe(6);
  });
});
