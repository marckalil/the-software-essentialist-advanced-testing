export type TransactionalEmail = {
  to: string;
  subject: string;
  text: string;
};

export interface TransactionalEmailAPI {
  sendEmail(email: TransactionalEmail): Promise<boolean>;
}
