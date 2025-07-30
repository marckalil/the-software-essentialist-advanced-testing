import { WebServer } from "../../shared/http/webServer";
import { ContactListAPI } from "./ports/contactListAPI";
import { MarketingController } from "./marketingController";
import { marketingErrorHandler } from "./marketingErrors";
import { MarketingService } from "./marketingService";
import { MailChimpContactList } from "./adapters/contactListApi/mailChimpContactList";
import { Config } from "../../shared/config";
import { ApplicationModule } from "../../shared/modules/applicationModule";
import { ContactListAPISpy } from "./adapters/contactListApi/contactListAPISpy";

export class MarketingModule extends ApplicationModule {
  private marketingService: MarketingService;
  private marketingController: MarketingController;
  private contactListAPI: ContactListAPI;

  private constructor(config: Config) {
    super(config);
    this.contactListAPI = this.buildContactListAPI();
    this.marketingService = this.createMarketingService();
    this.marketingController = this.createMarketingController();
  }

  static build(config: Config) {
    return new MarketingModule(config);
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
    if (this.contactListAPI) return this.contactListAPI;
    if (this.shouldBuildFakeRepository) return new ContactListAPISpy();
    return new MailChimpContactList();
  }

  public getMarketingController() {
    return this.marketingController;
  }

  public getMarketingService() {
    return this.marketingService;
  }

  public getContactListAPI() {
    return this.contactListAPI;
  }

  public mountRouter(webServer: WebServer) {
    webServer.mountRouter("/marketing", this.marketingController.getRouter());
  }
}
