import { ContactListAPI } from "./ports/contactListAPI";

import { ServerErrorException } from "../../shared/exceptions";

export class MarketingService {
  constructor(private contactListAPI: ContactListAPI) {}

  async addEmailToList(email: string) {
    try {
      const result = await this.contactListAPI.addEmailToList(email);
      return result;
    } catch (err) {
      throw new ServerErrorException();
    }
  }
}
