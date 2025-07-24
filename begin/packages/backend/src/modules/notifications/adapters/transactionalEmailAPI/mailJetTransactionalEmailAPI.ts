import { TransactionalEmailAPI } from "../../ports/transactionalEmailAPI";

export class MailJetTransactionalEmailAPI implements TransactionalEmailAPI {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    console.log(
      `MailJet: Sending email to ${to} with subject ${subject} and body ${body}`,
    );
  }
}
