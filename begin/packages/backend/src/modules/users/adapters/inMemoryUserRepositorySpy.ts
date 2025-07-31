import { User } from "@prisma/client";
import { UsersRepository } from "../ports/usersRepository";
import { CreateUserCommand } from "../usersCommand";
import { Spy } from "../../../shared/testDoubles/spy";

export class InMemoryUserRepositorySpy
  extends Spy<UsersRepository>
  implements UsersRepository
{
  private users: User[];

  constructor() {
    super();
    this.users = [];
  }
  async save(user: User): Promise<User> {
    this.addCall("save", [user]);
    const newUser = {
      ...user,
      id: this.users.length > 0 ? this.users[this.users.length - 1].id + 1 : 1,
      password: "password",
    };
    this.users.push(newUser);
    return Promise.resolve(newUser);
  }

  async update(
    id: number,
    updatedUser: Partial<CreateUserCommand>,
  ): Promise<User | null> {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) return Promise.resolve(null);

    const user = this.users[userIndex];
    this.users[userIndex] = { ...user, ...updatedUser };
    return Promise.resolve(this.users[userIndex]);
  }

  async delete(email: string): Promise<void> {
    const index = this.users.findIndex((user) => user.email === email);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
    return Promise.resolve();
  }

  async findById(id: number): Promise<User | null> {
    return Promise.resolve(this.users.find((user) => user.id === id) || null);
  }

  async findByEmail(email: string): Promise<User | null> {
    return Promise.resolve(
      this.users.find((user) => user.email === email) || null,
    );
  }

  async findByUsername(username: string): Promise<User | null> {
    return Promise.resolve(
      this.users.find((user) => user.username === username) || null,
    );
  }

  async reset(): Promise<void> {
    this.resetSpiedCalls();
    this.users = [];
    return Promise.resolve();
  }
}
