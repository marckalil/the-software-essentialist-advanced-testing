export interface TransactionalEmailAPI {
  sendEmail(email: {
    to: string;
    subject: string;
    text: string;
  }): Promise<void>;
}
