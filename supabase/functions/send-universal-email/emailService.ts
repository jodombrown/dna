
import { Resend } from "npm:resend@2.0.0";
import { EmailContent } from "./emailTemplates.ts";

export interface EmailServiceConfig {
  resendApiKey: string;
  fromEmail: string;
  adminEmail: string;
}

export class EmailService {
  private resend: Resend;
  private config: EmailServiceConfig;

  constructor(config: EmailServiceConfig) {
    this.resend = new Resend(config.resendApiKey);
    this.config = config;
  }

  async sendAdminEmail(emailContent: EmailContent) {
    return await this.resend.emails.send({
      from: this.config.fromEmail,
      to: [this.config.adminEmail],
      subject: emailContent.subject,
      html: emailContent.adminHtml,
    });
  }

  async sendUserConfirmationEmail(userEmail: string, emailContent: EmailContent) {
    return await this.resend.emails.send({
      from: this.config.fromEmail,
      to: [userEmail],
      subject: emailContent.userSubject,
      html: emailContent.userHtml,
    });
  }
}
