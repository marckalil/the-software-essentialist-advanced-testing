import { MailJetTransactionalEmailAPI } from "./adapters/transactionalEmailAPI/mailJetTransactionalEmailAPI";
import { TransactionalEmailAPI } from "./ports/transactionalEmailAPI";

export class NotificationsModule {
  private transactionalEmailAPI: TransactionalEmailAPI;

  private constructor() {
    this.transactionalEmailAPI = this.createTransactionalEmailAPI();
  }

  static build() {
    return new NotificationsModule();
  }

  public getTransactionalEmailAPI() {
    return this.transactionalEmailAPI;
  }

  private createTransactionalEmailAPI() {
    return new MailJetTransactionalEmailAPI();
  }
}
