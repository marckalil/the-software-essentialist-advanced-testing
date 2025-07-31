import { CreateUserBuilder } from "@dddforum/shared/tests/support/builders/createUserBuilder";
import { CompositionRoot } from "@dddforum/backend/src/shared/compositionRoot";
import { Config } from "@dddforum/backend/src/shared/config";
import { createAPIClient } from "@dddforum/shared/src/api";
import { CreateUserParams } from "@dddforum/shared/src/api/users";

describe("Users HTTP API", () => {
  let createUserSpy: jest.SpyInstance;
  const apiClient = createAPIClient("http://localhost:3000");
  const config = new Config("test:infra");
  const compositionRoot = CompositionRoot.createCompositionRoot(config);
  const application = compositionRoot.getApplication();
  const webServer = compositionRoot.getWebServer();

  beforeAll(async () => {
    await webServer.start();
    createUserSpy = jest.spyOn(application.users, "createUser");
  });

  afterAll(async () => {
    await webServer.stop();
  });

  afterEach(() => {
    createUserSpy.mockClear();
  });

  describe("Successfully creating a user", () => {
    it("should create a user and call the createUser use case", async () => {
      const createUserParams = new CreateUserBuilder()
        .withFirstName("Randy")
        .withLastName("March")
        .withEmail("randy.march@example.com")
        .withUsername("randymarch")
        .build();

      const createUserResponseStub = new CreateUserBuilder()
        .withFirstName(createUserParams.firstName)
        .withLastName(createUserParams.lastName)
        .withEmail(createUserParams.email)
        .withUsername(createUserParams.username)
        .build();

      createUserSpy.mockResolvedValue(createUserResponseStub);

      // Act - Call the API and capture the response
      const response = await apiClient.users.register(createUserParams);

      // Assert - Verify both communication and response
      expect(application.users.createUser).toHaveBeenCalledTimes(1);

      // Verify the API response structure and content
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data!.firstName).toBe(createUserParams.firstName);
      expect(response.data!.lastName).toBe(createUserParams.lastName);
      expect(response.data!.email).toBe(createUserParams.email);
      expect(response.data!.username).toBe(createUserParams.username);
      expect(response.error).toEqual({});
    });
  });
  describe("Failing to create a user", () => {
    describe("When a required field is missing", () => {
      it("should return an error response", async () => {
        const createUserParams = new CreateUserBuilder()
          .withFirstName("Randy")
          .withLastName("March")
          .withEmail("randy.march@example.com")
          .withUsername("")
          .build();

        const response = await apiClient.users.register({
          ...createUserParams,
          username: undefined,
        } as unknown as CreateUserParams);
        expect(response.success).toBe(false);
        expect(response.error.code).toBe("ValidationError");
        expect(response.data).toBeNull();
      });
    });
  });
});
