export interface TransactionalEmailAPI {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}
