import { User } from "@dddforum/shared/src/api/users";
import { ValidatedUser } from "@dddforum/shared/src/api/users";

export interface UsersRepository {
  save(user: ValidatedUser): Promise<User & { password: string }>;
  update(id: string, user: Partial<ValidatedUser>): Promise<User>;
  delete(id: string): Promise<void>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserByUsername(username: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
}
