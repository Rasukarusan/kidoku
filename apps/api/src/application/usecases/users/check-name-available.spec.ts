import { CheckNameAvailableUseCase } from './check-name-available';
import { IUserRepository } from '../../../domain/repositories/user';
import { User } from '../../../domain/models/user';

describe('CheckNameAvailableUseCase', () => {
  let useCase: CheckNameAvailableUseCase;
  let mockUserRepo: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepo = {
      findById: jest.fn(),
      findByName: jest.fn(),
      updateName: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;

    useCase = new CheckNameAvailableUseCase(mockUserRepo);
  });

  it('未使用の名前はtrueを返す', async () => {
    mockUserRepo.findByName.mockResolvedValue(null);

    const result = await useCase.execute('新しい名前');

    expect(result).toBe(true);
    expect(mockUserRepo.findByName).toHaveBeenCalledWith('新しい名前');
  });

  it('使用済みの名前はfalseを返す', async () => {
    const existingUser = User.fromDatabase(
      'user-1',
      '既存ユーザー',
      'test@example.com',
      null,
      false,
    );
    mockUserRepo.findByName.mockResolvedValue(existingUser);

    const result = await useCase.execute('既存ユーザー');

    expect(result).toBe(false);
  });
});
