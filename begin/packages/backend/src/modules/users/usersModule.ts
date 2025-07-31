import { Config } from "../../shared/config";
import { Database } from "../../shared/database";
import { WebServer } from "../../shared/http/webServer";
import { ApplicationModule } from "../../shared/modules/applicationModule";
import { TransactionalEmailAPI } from "../notifications/ports/transactionalEmailAPI";
import { InMemoryUserRepositorySpy } from "./adapters/inMemoryUserRepositorySpy";
import { ProductionUsersRepository } from "./adapters/productionUsersRepository";
import { UsersRepository } from "./ports/usersRepository";
import { UsersController } from "./usersController";
import { userErrorHandler } from "./usersErrors";
import { UsersService } from "./usersService";

export class UsersModule extends ApplicationModule {
  private usersRepository: UsersRepository;
  private usersService: UsersService;
  private usersController: UsersController;

  private constructor(
    private dbConnection: Database,
    private emailAPI: TransactionalEmailAPI,
    config: Config,
  ) {
    super(config);
    this.usersRepository = this.createUsersRepository();
    this.usersService = this.createUsersService();
    this.usersController = this.createUsersController();
  }

  static build(
    dbConnection: Database,
    emailAPI: TransactionalEmailAPI,
    config: Config,
  ) {
    return new UsersModule(dbConnection, emailAPI, config);
  }

  private createUsersRepository() {
    if (this.usersRepository) return this.usersRepository;
    if (this.shouldBuildFakeRepository) return new InMemoryUserRepositorySpy();
    return new ProductionUsersRepository(this.dbConnection.getConnection());
  }

  private createUsersService() {
    return new UsersService(this.usersRepository, this.emailAPI);
  }

  private createUsersController() {
    return new UsersController(this.usersService, userErrorHandler);
  }

  public getController() {
    return this.usersController;
  }

  public getUsersService() {
    return this.usersService;
  }

  public getUsersRepository() {
    return this.usersRepository;
  }

  public mountRouter(webServer: WebServer) {
    webServer.mountRouter("/users", this.usersController.getRouter());
  }
}
