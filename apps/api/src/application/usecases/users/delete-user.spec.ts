import { DeleteUserUseCase } from './delete-user';
import { IUserRepository } from '../../../domain/repositories/user';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let mockUserRepo: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepo = {
      findById: jest.fn(),
      findByName: jest.fn(),
      updateName: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;

    useCase = new DeleteUserUseCase(mockUserRepo);
  });

  it('ユーザーを削除できる', async () => {
    mockUserRepo.delete.mockResolvedValue(undefined);

    await useCase.execute('user-1');

    expect(mockUserRepo.delete).toHaveBeenCalledWith('user-1');
  });
});
