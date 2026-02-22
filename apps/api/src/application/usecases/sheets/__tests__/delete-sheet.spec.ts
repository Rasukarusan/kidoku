import { NotFoundException } from '@nestjs/common';
import { DeleteSheetUseCase } from '../delete-sheet';
import { ISheetRepository } from '../../../../domain/repositories/sheet';
import { Sheet } from '../../../../domain/models/sheet';

describe('DeleteSheetUseCase', () => {
  let useCase: DeleteSheetUseCase;
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

    useCase = new DeleteSheetUseCase(mockSheetRepo);
  });

  it('所有するシートを削除できる', async () => {
    const sheet = Sheet.fromDatabase(
      '1',
      'user-1',
      'マイシート',
      0,
      new Date(),
      new Date(),
    );
    mockSheetRepo.findById.mockResolvedValue(sheet);

    await useCase.execute('user-1', '1');

    expect(mockSheetRepo.delete).toHaveBeenCalledWith('1');
  });

  it('シートが見つからない場合はNotFoundExceptionを投げる', async () => {
    mockSheetRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('user-1', '999')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('他ユーザーのシートを削除しようとするとNotFoundExceptionを投げる', async () => {
    const sheet = Sheet.fromDatabase(
      '1',
      'other-user',
      'マイシート',
      0,
      new Date(),
      new Date(),
    );
    mockSheetRepo.findById.mockResolvedValue(sheet);

    await expect(useCase.execute('user-1', '1')).rejects.toThrow(
      NotFoundException,
    );

    expect(mockSheetRepo.delete).not.toHaveBeenCalled();
  });
});
