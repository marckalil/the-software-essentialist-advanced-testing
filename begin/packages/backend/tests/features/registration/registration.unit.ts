import { defineFeature, loadFeature } from "jest-cucumber";
import * as path from "path";
import { sharedTestRoot } from "@dddforum/shared/src/paths";
import { Application } from "@dddforum/backend/src/shared/application";
import { User } from "@dddforum/shared/src/api/users";
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
  let fakeRepository: InMemoryUserRepositorySpy;

  beforeAll(() => {
    const config = new Config("test:unit");
    compositionRoot = CompositionRoot.createCompositionRoot(config);
    application = compositionRoot.getApplication();
    fakeRepository = compositionRoot.getRepositories()
      .users as InMemoryUserRepositorySpy;
  });

  afterEach(async () => {
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
      createUserCommand = new CreateUserCommand(createUserInput);
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
      expect(createUserResponse.id).toBeDefined();
      expect(createUserResponse.email).toEqual(createUserCommand.email);
      expect(createUserResponse.firstName).toEqual(createUserCommand.firstName);
      expect(createUserResponse.lastName).toEqual(createUserCommand.lastName);
      expect(createUserResponse.username).toEqual(createUserCommand.username);

      const getUserByEmailResponse = await application.users.getUserByEmail(
        createUserCommand.email,
      );
      expect(getUserByEmailResponse.email).toEqual(createUserCommand.email);
    });
    and("I should expect to receive marketing emails", () => {
      // todo
    });
  });

  test.skip("Successful registration without marketing emails accepted", ({
    given,
    when,
    then,
    and,
  }) => {
    given("I am a new user", () => {});
    when(
      "I register with valid account details declining marketing emails",
      () => {},
    );
    then("I should be granted access to my account", () => {});
    and("I should not expect to receive marketing emails", () => {});
  });

  test.skip("Invalid or missing registration details", ({
    given,
    when,
    then,
    and,
  }) => {
    given("I am a new user", () => {});
    when("I register with invalid account details", () => {});
    then(
      "I should see an error notifying me that my input is invalid",
      () => {},
    );
    and("I should not have been sent access to account details", () => {});
  });

  test.skip("Account already created with email", ({
    given,
    when,
    then,
    and,
  }) => {
    given("a set of users already created accounts", (table) => {});
    when("new users attempt to register with those emails", () => {});
    then(
      "they should see an error notifying them that the account already exists",
      () => {},
    );
    and("they should not have been sent access to account details", () => {});
  });
});
