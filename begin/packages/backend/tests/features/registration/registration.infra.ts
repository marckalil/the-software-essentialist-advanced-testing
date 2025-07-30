import { defineFeature, loadFeature } from "jest-cucumber";
import * as path from "path";
import { sharedTestRoot } from "@dddforum/shared/src/paths";
import { Application } from "@dddforum/backend/src/shared/application";
import { CreateUserParams, User } from "@dddforum/shared/src/api/users";
import { CreateUserCommand } from "@dddforum/backend/src/modules/users/usersCommand";
import { CompositionRoot } from "@dddforum/backend/src/shared/compositionRoot";
import { Config } from "@dddforum/backend/src/shared/config";
import { CreateUserBuilder } from "@dddforum/shared/tests/support/builders/createUserBuilder";
import { TransactionalEmailAPISpy } from "@dddforum/backend/src/modules/notifications/adapters/transactionalEmailAPI/transactionalEmailAPISpy";
import { ContactListAPISpy } from "@dddforum/backend/src/modules/marketing/adapters/contactListApi/contactListAPISpy";
import { ProductionUsersRepository } from "@dddforum/backend/src/modules/users/adapters/productionUsersRepository";

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
  let usersRepository: ProductionUsersRepository;
  let contactListAPI: ContactListAPISpy;
  let transactionalEmailAPI: TransactionalEmailAPISpy;

  beforeAll(async () => {
    const config = new Config("test:infra");
    compositionRoot = CompositionRoot.createCompositionRoot(config);
    application = compositionRoot.getApplication();
    usersRepository = compositionRoot.getRepositories()
      .users as ProductionUsersRepository;
    contactListAPI = compositionRoot.getContactListAPI() as ContactListAPISpy;
    transactionalEmailAPI =
      compositionRoot.getTransactionalEmailAPI() as TransactionalEmailAPISpy;
  });

  beforeEach(async () => {
    contactListAPI.reset();
    transactionalEmailAPI.reset();
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
      expect(transactionalEmailAPI.getTimesMethodCalled("sendEmail")).toEqual(
        1,
      );
    });
    and("I should expect to receive marketing emails", () => {
      expect(addEmailToListResponse).toBeTruthy();
      expect(contactListAPI.getTimesMethodCalled("addEmailToList")).toEqual(1);
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

      expect(transactionalEmailAPI.getTimesMethodCalled("sendEmail")).toEqual(
        1,
      );
    });
    and("I should not expect to receive marketing emails", () => {
      expect(addEmailToListResponse).toBeFalsy();
      expect(contactListAPI.getTimesMethodCalled("addEmailToList")).toEqual(0);
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
      expect(error).toBeDefined();
    });
    and("I should not have been sent access to account details", () => {
      expect(transactionalEmailAPI.getTimesMethodCalled("sendEmail")).toEqual(
        0,
      );
      expect(contactListAPI.getTimesMethodCalled("addEmailToList")).toEqual(0);
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
        transactionalEmailAPI.reset();
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
      expect(transactionalEmailAPI.getTimesMethodCalled("sendEmail")).toEqual(
        0,
      );
      expect(contactListAPI.getTimesMethodCalled("addEmailToList")).toEqual(0);
    });
  });
});
