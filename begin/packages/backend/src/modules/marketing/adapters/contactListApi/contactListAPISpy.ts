import { Spy } from "../../../../shared/testDoubles/spy";
import { ContactListAPI } from "../../ports/contactListAPI";

export class ContactListAPISpy
  extends Spy<ContactListAPI>
  implements ContactListAPI
{
  async addEmailToList(email: string): Promise<boolean> {
    this.addCall("addEmailToList", [email]);
    console.log(`ContactListSpy: Adding ${email} to list... for test usage.`);
    return true;
  }

  public reset() {
    this.resetSpiedCalls();
  }
}
