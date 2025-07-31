import { Application } from "../application";
import { Config } from "../config";
import { Database } from "../database";
import { WebServer } from "../http";
import {
  UsersModule,
  PostsModule,
  NotificationsModule,
  MarketingModule,
} from "@dddforum/backend/src/modules";
export class CompositionRoot {
  private static instance: CompositionRoot | null = null;

  private webServer: WebServer;
  private dbConnection: Database;
  private config: Config;

  private usersModule: UsersModule;
  private marketingModule: MarketingModule;
  private postsModule: PostsModule;
  private notificationsModule: NotificationsModule;

  public static createCompositionRoot(config: Config) {
    if (!CompositionRoot.instance) {
      CompositionRoot.instance = new this(config);
    }
    return CompositionRoot.instance;
  }

  private constructor(config: Config) {
    this.config = config;
    this.dbConnection = this.createDBConnection();
    this.notificationsModule = this.createNotificationsModule();
    this.marketingModule = this.createMarketingModule();
    this.usersModule = this.createUsersModule();
    this.postsModule = this.createPostsModule();
    this.webServer = this.createWebServer();
    this.mountRoutes();
  }

  createNotificationsModule() {
    return NotificationsModule.build(this.config);
  }

  createMarketingModule() {
    return MarketingModule.build(this.config);
  }

  createUsersModule() {
    return UsersModule.build(
      this.dbConnection,
      this.notificationsModule.getTransactionalEmailAPI(),
      this.config,
    );
  }

  createPostsModule() {
    return PostsModule.build(this.dbConnection, this.config);
  }

  getDBConnection() {
    if (!this.dbConnection) this.createDBConnection();
    return this.dbConnection;
  }

  createWebServer() {
    return new WebServer({ port: 3000, env: this.config.getEnvironment() });
  }

  getWebServer() {
    return this.webServer;
  }

  private mountRoutes() {
    this.marketingModule.mountRouter(this.webServer);
    this.usersModule.mountRouter(this.webServer);
    this.postsModule.mountRouter(this.webServer);
  }

  private createDBConnection() {
    const dbConnection = new Database();
    if (!this.dbConnection) {
      this.dbConnection = dbConnection;
    }
    return dbConnection;
  }

  public getApplication(): Application {
    return {
      users: this.usersModule.getUsersService(),
      posts: this.postsModule.getPostsService(),
      marketing: this.marketingModule.getMarketingService(),
    };
  }

  getRepositories() {
    return {
      users: this.usersModule.getUsersRepository(),
      posts: this.postsModule.getPostsRepository(),
    };
  }

  getTransactionalEmailAPI() {
    return this.notificationsModule.getTransactionalEmailAPI();
  }

  getContactListAPI() {
    return this.marketingModule.getContactListAPI();
  }
}
