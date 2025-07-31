import { ContactListAPI } from "../../ports/contactListAPI";

export class MailChimpContactList implements ContactListAPI {
  async addEmailToList(email: string): Promise<boolean> {
    console.log(
      `MailChimpContactList: Adding ${email} to list... for production usage.`,
    );
    return true;
  }
}
