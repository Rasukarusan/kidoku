import { NotFoundException } from '@nestjs/common';
import { UpdateSheetOrdersUseCase } from './update-sheet-orders';
import { ISheetRepository } from '../../../domain/repositories/sheet';
import { Sheet } from '../../../domain/models/sheet';

describe('UpdateSheetOrdersUseCase', () => {
  let useCase: UpdateSheetOrdersUseCase;
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

    useCase = new UpdateSheetOrdersUseCase(mockSheetRepo);
  });

  it('シートの並び順を更新できる', async () => {
    const sheet1 = Sheet.fromDatabase(
      '1',
      'user-1',
      '2025',
      1,
      new Date(),
      new Date(),
    );
    const sheet2 = Sheet.fromDatabase(
      '2',
      'user-1',
      '2024',
      2,
      new Date(),
      new Date(),
    );
    mockSheetRepo.findById.mockResolvedValueOnce(sheet1);
    mockSheetRepo.findById.mockResolvedValueOnce(sheet2);
    mockSheetRepo.saveAll.mockResolvedValue(undefined);

    await useCase.execute('user-1', [
      { id: '1', order: 2 },
      { id: '2', order: 1 },
    ]);

    expect(mockSheetRepo.saveAll).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ order: 2 }),
        expect.objectContaining({ order: 1 }),
      ]),
    );
  });

  it('シートが見つからない場合はNotFoundExceptionをスローする', async () => {
    mockSheetRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('user-1', [{ id: '999', order: 1 }]),
    ).rejects.toThrow(NotFoundException);
  });

  it('他ユーザーのシートの場合はNotFoundExceptionをスローする', async () => {
    const otherUserSheet = Sheet.fromDatabase(
      '1',
      'other-user',
      '2025',
      1,
      new Date(),
      new Date(),
    );
    mockSheetRepo.findById.mockResolvedValue(otherUserSheet);

    await expect(
      useCase.execute('user-1', [{ id: '1', order: 1 }]),
    ).rejects.toThrow(NotFoundException);
  });
});
