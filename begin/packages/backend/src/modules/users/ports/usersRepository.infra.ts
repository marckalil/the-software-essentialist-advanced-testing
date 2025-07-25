import { PrismaClient } from "@prisma/client";

import { CreateUserBuilder } from "@dddforum/shared/tests/support/builders/createUserBuilder";

import { UsersRepository } from "./usersRepository";
import { generateRandomPassword } from "../../../shared/utils";
import { ProductionUsersRepository } from "../adapters/productionUsersRepository";
import { InMemoryUserRepositorySpy } from "../adapters/inMemoryUserRepositorySpy";

describe("UsersRepository", () => {
  const usersRepositories: [type: string, repository: UsersRepository][] = [
    [
      "Production UsersRepository",
      new ProductionUsersRepository(new PrismaClient()),
    ],
    ["InMemory UsersRepository", new InMemoryUserRepositorySpy()],
  ];

  describe.each(usersRepositories)("%s", (_, repository) => {
    it("can save and retrieve a user by its email", async () => {
      const createUserInput = new CreateUserBuilder()
        .withAllRandomDetails()
        .build();

      const savedUser = await repository.save({
        ...createUserInput,
        password: generateRandomPassword(10),
      });

      const retrievedUser = await repository.findByEmail(savedUser.email);
      expect(savedUser).toBeDefined();
      expect(retrievedUser).toBeDefined();
      expect(savedUser.email).toEqual(retrievedUser?.email);
    });

    it("can save and retrieve a user by its username", async () => {
      const createUserInput = new CreateUserBuilder()
        .withAllRandomDetails()
        .build();

      const savedUser = await repository.save({
        ...createUserInput,
        password: generateRandomPassword(10),
      });

      const retrievedUser = await repository.findByUsername(savedUser.username);
      expect(savedUser).toBeDefined();
      expect(retrievedUser).toBeDefined();
      expect(savedUser.username).toEqual(retrievedUser?.username);
    });
  });
});
