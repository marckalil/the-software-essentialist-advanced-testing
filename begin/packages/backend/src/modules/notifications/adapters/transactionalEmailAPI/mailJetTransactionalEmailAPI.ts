import { TransactionalEmailAPI } from "../../ports/transactionalEmailAPI";

export class MailJetTransactionalEmailAPI implements TransactionalEmailAPI {
  async sendEmail(email: {
    to: string;
    subject: string;
    text: string;
  }): Promise<void> {
    const { to, subject, text } = email;
    console.log(
      `MailJet: Sending email to ${to} with subject ${subject} and text ${text}`,
    );
  }
}
