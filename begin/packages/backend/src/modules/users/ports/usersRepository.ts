import { User } from "@dddforum/shared/src/api/users";
import { ValidatedUser } from "@dddforum/shared/src/api/users";

export interface UsersRepository {
  save(user: ValidatedUser): Promise<User & { password: string }>;
  update(id: string, user: Partial<ValidatedUser>): Promise<User>;
  delete(id: string): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}
