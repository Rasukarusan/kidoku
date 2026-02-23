import { UpdateUserNameUseCase } from './update-user-name';
import { IUserRepository } from '../../../domain/repositories/user';
import { User } from '../../../domain/models/user';

describe('UpdateUserNameUseCase', () => {
  let useCase: UpdateUserNameUseCase;
  let mockUserRepo: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepo = {
      findById: jest.fn(),
      findByName: jest.fn(),
      updateName: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;

    useCase = new UpdateUserNameUseCase(mockUserRepo);
  });

  it('ユーザー名を更新できる', async () => {
    const updatedUser = User.fromDatabase(
      'user-1',
      '新しい名前',
      'test@example.com',
      null,
      false,
    );
    mockUserRepo.updateName.mockResolvedValue(updatedUser);

    const result = await useCase.execute('user-1', '新しい名前');

    expect(result.name).toBe('新しい名前');
    expect(mockUserRepo.updateName).toHaveBeenCalledWith(
      'user-1',
      '新しい名前',
    );
  });
});
