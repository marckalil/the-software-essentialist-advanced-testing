import { Spy } from "../../../../shared/testDoubles/spy";
import type {
  TransactionalEmail,
  TransactionalEmailAPI,
} from "../../ports/transactionalEmailAPI";

export class TransactionalEmailAPISpy
  extends Spy<TransactionalEmailAPI>
  implements TransactionalEmailAPI
{
  constructor() {
    super();
  }

  public async sendEmail(email: TransactionalEmail): Promise<boolean> {
    this.addCall("sendEmail", [email]);
    const { to, subject, text } = email;
    console.log(
      `TransactionalEmailAPISpy: Sending email to ${to} with subject ${subject} and text ${text}`,
    );
    return true;
  }

  public reset() {
    this.resetSpiedCalls();
  }
}
