import { defineFeature, loadFeature } from "jest-cucumber";
import * as path from "path";
import { sharedTestRoot } from "@dddforum/shared/src/paths";
import { Application } from "@dddforum/backend/src/shared/application";
import { CreateUserParams, User } from "@dddforum/shared/src/api/users";
import { CreateUserCommand } from "@dddforum/backend/src/modules/users/usersCommand";
import { CompositionRoot } from "@dddforum/backend/src/shared/compositionRoot";
import { Config } from "@dddforum/backend/src/shared/config";
import { InMemoryUserRepositorySpy } from "@dddforum/backend/src/modules/users/adapters/inMemoryUserRepositorySpy";
import { CreateUserBuilder } from "@dddforum/shared/tests/support/builders/createUserBuilder";

const feature = loadFeature(
  path.join(sharedTestRoot, "features/registration.feature"),
  { tagFilter: "@backend" },
);

defineFeature(feature, (test) => {
  let application: Application;
  let addEmailToListResponse: boolean | undefined;
  let compositionRoot: CompositionRoot;
  let createUserCommand: CreateUserCommand;
  let createUserResponse: User;
  let createUserInput: CreateUserParams;
  let fakeRepository: InMemoryUserRepositorySpy;

  beforeAll(async () => {
    const config = new Config("test:unit");
    compositionRoot = CompositionRoot.createCompositionRoot(config);
    application = compositionRoot.getApplication();
    fakeRepository = compositionRoot.getRepositories()
      .users as InMemoryUserRepositorySpy;
  });

  beforeEach(async () => {
    await fakeRepository.reset();
    addEmailToListResponse = undefined;
  });

  test("Successful registration with marketing emails accepted", ({
    given,
    when,
    then,
    and,
  }) => {
    given("I am a new user", () => {
      const createUserInput = new CreateUserBuilder()
        .withAllRandomDetails()
        .build();
      createUserCommand = CreateUserCommand.fromRequest(createUserInput);
    });
    when(
      "I register with valid account details accepting marketing emails",
      async () => {
        createUserResponse =
          await application.users.createUser(createUserCommand);
        addEmailToListResponse = await application.marketing.addEmailToList(
          createUserCommand.email,
        );
      },
    );
    then("I should be granted access to my account", async () => {
      // Result verification
      expect(createUserResponse.id).toBeDefined();
      expect(createUserResponse.email).toEqual(createUserCommand.email);
      expect(createUserResponse.firstName).toEqual(createUserCommand.firstName);
      expect(createUserResponse.lastName).toEqual(createUserCommand.lastName);
      expect(createUserResponse.username).toEqual(createUserCommand.username);

      // State verification
      const getUserByEmailResponse = await application.users.getUserByEmail(
        createUserCommand.email,
      );
      expect(getUserByEmailResponse.email).toEqual(createUserCommand.email);

      // Communication verification
      expect(fakeRepository.getTimesMethodCalled("save")).toEqual(1);
    });
    and("I should expect to receive marketing emails", () => {
      // todo
    });
  });

  test("Successful registration without marketing emails accepted", ({
    given,
    when,
    then,
    and,
  }) => {
    given("I am a new user", () => {
      const createUserInput = new CreateUserBuilder()
        .withAllRandomDetails()
        .build();
      createUserCommand = CreateUserCommand.fromRequest(createUserInput);
    });
    when(
      "I register with valid account details declining marketing emails",
      async () => {
        createUserResponse =
          await application.users.createUser(createUserCommand);
      },
    );
    then("I should be granted access to my account", async () => {
      expect(createUserResponse.id).toBeDefined();
      expect(createUserResponse.email).toEqual(createUserCommand.email);
      expect(createUserResponse.firstName).toEqual(createUserCommand.firstName);
      expect(createUserResponse.lastName).toEqual(createUserCommand.lastName);
      expect(createUserResponse.username).toEqual(createUserCommand.username);

      const getUserByEmailResponse = await application.users.getUserByEmail(
        createUserCommand.email,
      );
      expect(getUserByEmailResponse.email).toEqual(createUserCommand.email);

      expect(fakeRepository.getTimesMethodCalled("save")).toEqual(1);
    });
    and("I should not expect to receive marketing emails", () => {
      // todo
    });
  });

  test("Invalid or missing registration details", ({
    given,
    when,
    then,
    and,
  }) => {
    let error: any;
    given("I am a new user", () => {
      createUserInput = new CreateUserBuilder()
        .withAllRandomDetails()
        .withEmail("")
        .build();
    });
    when("I register with invalid account details", async () => {
      try {
        createUserCommand = CreateUserCommand.fromRequest(createUserInput);
        await application.users.createUser(createUserCommand);
      } catch (e) {
        error = e;
      }
    });
    then("I should see an error notifying me that my input is invalid", () => {
      expect(fakeRepository.getTimesMethodCalled("save")).toEqual(0);
      expect(error).toBeDefined();
    });
    and("I should not have been sent access to account details", () => {
      // todo
    });
  });

  test("Account already created with email", ({ given, when, then, and }) => {
    const inputs: CreateUserParams[] = [];
    const createUserErrors: any[] = [];

    given("a set of users already created accounts", async (table) => {
      for (const row of table) {
        const createUserInput = new CreateUserBuilder()
          .withAllRandomDetails()
          .withEmail(row.email)
          .withFirstName(row.firstName)
          .withLastName(row.lastName)
          .build();
        inputs.push(createUserInput);
        const createUserCommand =
          CreateUserCommand.fromRequest(createUserInput);
        await application.users.createUser(createUserCommand);
      }
    });
    when("new users attempt to register with those emails", async () => {
      for (const input of inputs) {
        try {
          const createUserCommand = CreateUserCommand.fromRequest(input);
          await application.users.createUser(createUserCommand);
        } catch (error) {
          createUserErrors.push(error);
        }
      }
    });
    then(
      "they should see an error notifying them that the account already exists",
      async () => {
        expect(createUserErrors).toHaveLength(inputs.length);
        for (const error of createUserErrors) {
          expect(error).toEqual(
            expect.objectContaining({
              type: "EmailAlreadyInUseException",
            }),
          );
        }
      },
    );
    and("they should not have been sent access to account details", () => {
      // todo
    });
  });
});
