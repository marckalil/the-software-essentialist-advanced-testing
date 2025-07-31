import { User } from "@dddforum/shared/src/api/users";
import { ValidatedUser } from "@dddforum/shared/src/api/users";

export interface UsersRepository {
  save(user: ValidatedUser): Promise<User & { password: string }>;
  update(id: number, user: Partial<ValidatedUser>): Promise<User | null>;
  delete(email: string): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
}
