import { Config } from "../../shared/config";
import { ApplicationModule } from "../../shared/modules/applicationModule";
import { MailJetTransactionalEmailAPI } from "./adapters/transactionalEmailAPI/mailJetTransactionalEmailAPI";
import { TransactionalEmailAPISpy } from "./adapters/transactionalEmailAPI/transactionalEmailAPISpy";
import { TransactionalEmailAPI } from "./ports/transactionalEmailAPI";

export class NotificationsModule extends ApplicationModule {
  private transactionalEmailAPI: TransactionalEmailAPI;

  private constructor(config: Config) {
    super(config);
    this.transactionalEmailAPI = this.createTransactionalEmailAPI();
  }

  static build(config: Config) {
    return new NotificationsModule(config);
  }

  public getTransactionalEmailAPI() {
    return this.transactionalEmailAPI;
  }

  private createTransactionalEmailAPI() {
    if (this.transactionalEmailAPI) return this.transactionalEmailAPI;
    if (this.getEnvironment() === "production")
      return new MailJetTransactionalEmailAPI();
    return new TransactionalEmailAPISpy();
  }
}
