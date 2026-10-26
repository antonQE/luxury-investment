export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/** Transactional email port — see ADR-0011. */
export interface MailerPort {
  send(message: MailMessage): Promise<void>;
}
