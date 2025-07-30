import { Database } from "../../shared/database";
import { WebServer } from "../../shared/http/webServer";
import { ProductionPostsRepository } from "./adapters/productionPortsRepository";
import { PostsController } from "./postsController";
import { postsErrorHandler } from "./postsErrors";
import { PostsService } from "./postsService";
import { PostsRepository } from "./ports/postsRepository";
import { ApplicationModule } from "../../shared/modules/applicationModule";
import { Config } from "../../shared/config";
import { InMemoryPostsRepositorySpy } from "./adapters/inMemoryPostsRepository";

export class PostsModule extends ApplicationModule {
  private postsRepository: PostsRepository;
  private postsService: PostsService;
  private postsController: PostsController;

  private constructor(
    private dbConnection: Database,
    config: Config,
  ) {
    super(config);
    this.postsRepository = this.createPostsRepository();
    this.postsService = this.createPostsService();
    this.postsController = this.createPostsController();
  }

  static build(dbConnection: Database, config: Config) {
    return new PostsModule(dbConnection, config);
  }

  private createPostsRepository() {
    if (this.postsRepository) return this.postsRepository;
    if (this.shouldBuildFakeRepository) return new InMemoryPostsRepositorySpy();
    return new ProductionPostsRepository(this.dbConnection.getConnection());
  }

  private createPostsService() {
    return new PostsService(this.postsRepository);
  }

  private createPostsController() {
    return new PostsController(this.postsService, postsErrorHandler);
  }

  public getPostsController() {
    return this.postsController;
  }

  public getPostsService() {
    return this.postsService;
  }

  public getPostsRepository() {
    return this.postsRepository;
  }

  public mountRouter(webServer: WebServer) {
    webServer.mountRouter("/posts", this.postsController.getRouter());
  }
}
