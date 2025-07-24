import { PrismaClient } from "@prisma/client";

import { CreateUserBuilder } from "@dddforum/shared/tests/support/builders/createUserBuilder";

import { UsersRepository } from "./usersRepository";
import { generateRandomPassword } from "../../../shared/utils";

describe("UsersRepository", () => {
  const usersRepositories: [type: string, repository: UsersRepository][] = [
    [
      "Production Users Repository",
      new ProductionUsersRepository(new PrismaClient()),
    ],
  ];

  describe.each(usersRepositories)("%s", (_, repository) => {
    it("can save and retrieve a user by its email", async () => {
      const createUserInput = new CreateUserBuilder()
        .withAllRandomDetails()
        .withEmail("john.doe@example.com")
        .build();

      const savedUser = await repository.save({
        ...createUserInput,
        password: generateRandomPassword(10),
      });

      const retrievedUser = await repository.findByEmail(
        "john.doe@example.com",
      );
      expect(savedUser).toBeDefined();
      expect(retrievedUser).toBeDefined();
      expect(savedUser.email).toEqual(retrievedUser?.email);
    });

    it("can save and retrieve a user by its username", async () => {
      const createUserInput = new CreateUserBuilder()
        .withAllRandomDetails()
        .withUsername("john_doe")
        .build();

      const savedUser = await repository.save({
        ...createUserInput,
        password: generateRandomPassword(10),
      });

      const retrievedUser = await repository.findByUsername("john_doe");
      expect(savedUser).toBeDefined();
      expect(retrievedUser).toBeDefined();
      expect(savedUser.username).toEqual(retrievedUser?.username);
    });
  });
});
