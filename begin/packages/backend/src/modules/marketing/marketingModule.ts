import { WebServer } from "../../shared/http/webServer";
import { ContactListAPI } from "./ports/contactListAPI";
import { MarketingController } from "./marketingController";
import { marketingErrorHandler } from "./marketingErrors";
import { MarketingService } from "./marketingService";
import { MailChimpContactList } from "./adapters/contactListApi/mailChimpContactList";

export class MarketingModule {
  private marketingService: MarketingService;
  private marketingController: MarketingController;
  private contactListAPI: ContactListAPI;

  private constructor() {
    this.contactListAPI = this.buildContactListAPI();
    this.marketingService = this.createMarketingService();
    this.marketingController = this.createMarketingController();
  }

  static build() {
    return new MarketingModule();
  }

  private createMarketingService() {
    return new MarketingService(this.contactListAPI);
  }

  private createMarketingController() {
    return new MarketingController(
      this.marketingService,
      marketingErrorHandler,
    );
  }

  private buildContactListAPI() {
    return new MailChimpContactList();
  }

  public getMarketingController() {
    return this.marketingController;
  }

  public mountRouter(webServer: WebServer) {
    webServer.mountRouter("/marketing", this.marketingController.getRouter());
  }
}
