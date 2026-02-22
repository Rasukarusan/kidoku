import { User } from '../models/user';

export abstract class IUserRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract findByName(name: string): Promise<User | null>;
  abstract updateName(id: string, name: string): Promise<User>;
  abstract delete(id: string): Promise<void>;
}
