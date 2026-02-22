import { NotFoundException } from '@nestjs/common';
import { UpdateSheetUseCase } from '../update-sheet';
import { ISheetRepository } from '../../../../domain/repositories/sheet';
import { Sheet } from '../../../../domain/models/sheet';

describe('UpdateSheetUseCase', () => {
  let useCase: UpdateSheetUseCase;
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

    useCase = new UpdateSheetUseCase(mockSheetRepo);
  });

  it('シート名を変更できる', async () => {
    const sheet = Sheet.fromDatabase(
      '1',
      'user-1',
      '旧シート名',
      0,
      new Date(),
      new Date(),
    );
    mockSheetRepo.findById.mockResolvedValue(sheet);
    mockSheetRepo.save.mockResolvedValue(sheet);

    const result = await useCase.execute('user-1', '1', '新シート名');

    expect(result.name).toBe('新シート名');
    expect(mockSheetRepo.save).toHaveBeenCalled();
  });

  it('シートが見つからない場合はNotFoundExceptionを投げる', async () => {
    mockSheetRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('user-1', '999', '新シート名'),
    ).rejects.toThrow(NotFoundException);
  });

  it('他ユーザーのシートはNotFoundExceptionを投げる', async () => {
    const sheet = Sheet.fromDatabase(
      '1',
      'other-user',
      'シート名',
      0,
      new Date(),
      new Date(),
    );
    mockSheetRepo.findById.mockResolvedValue(sheet);

    await expect(useCase.execute('user-1', '1', '新シート名')).rejects.toThrow(
      NotFoundException,
    );
  });
});
