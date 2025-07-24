import { Database } from "../../shared/database";
import { WebServer } from "../../shared/http/webServer";
import { TransactionalEmailAPI } from "../notifications/ports/transactionalEmailAPI";
import { ProductionUsersRepository } from "./adapters/productionUsersRepository";
import { UsersRepository } from "./ports/usersRepository";
import { UsersController } from "./usersController";
import { userErrorHandler } from "./usersErrors";
import { UsersService } from "./usersService";

export class UsersModule {
  private usersRepository: UsersRepository;
  private usersService: UsersService;
  private usersController: UsersController;

  private constructor(
    private dbConnection: Database,
    private emailAPI: TransactionalEmailAPI,
  ) {
    this.usersRepository = this.createUsersRepository();
    this.usersService = this.createUsersService();
    this.usersController = this.createUsersController();
  }

  static build(dbConnection: Database, emailAPI: TransactionalEmailAPI) {
    return new UsersModule(dbConnection, emailAPI);
  }

  private createUsersRepository() {
    if (this.usersRepository) return this.usersRepository;
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

  public mountRouter(webServer: WebServer) {
    webServer.mountRouter("/users", this.usersController.getRouter());
  }
}
