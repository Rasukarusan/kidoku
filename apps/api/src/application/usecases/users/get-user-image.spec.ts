import { GetUserImageUseCase } from './get-user-image';
import { IUserRepository } from '../../../domain/repositories/user';
import { User } from '../../../domain/models/user';

describe('GetUserImageUseCase', () => {
  let useCase: GetUserImageUseCase;
  let mockUserRepo: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepo = {
      findById: jest.fn(),
      findByName: jest.fn(),
      updateName: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;

    useCase = new GetUserImageUseCase(mockUserRepo);
  });

  it('ユーザーの画像URLを取得できる', async () => {
    const user = User.fromDatabase(
      'user-1',
      'testuser',
      'test@example.com',
      'https://example.com/image.jpg',
      false,
    );
    mockUserRepo.findByName.mockResolvedValue(user);

    const result = await useCase.execute('testuser');

    expect(result).toBe('https://example.com/image.jpg');
  });

  it('ユーザーが見つからない場合は空文字を返す', async () => {
    mockUserRepo.findByName.mockResolvedValue(null);

    const result = await useCase.execute('nonexistent');

    expect(result).toBe('');
  });

  it('ユーザーの画像がnullの場合は空文字を返す', async () => {
    const user = User.fromDatabase(
      'user-1',
      'testuser',
      'test@example.com',
      null,
      false,
    );
    mockUserRepo.findByName.mockResolvedValue(user);

    const result = await useCase.execute('testuser');

    expect(result).toBe('');
  });
});
