export interface EmailService {
  sendConfirmationEmail(email: string, confirmationToken: string): Promise<void>;
}