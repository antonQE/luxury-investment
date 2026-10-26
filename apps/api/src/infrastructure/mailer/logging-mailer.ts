import type { Logger } from '../../utils/logger.ts';
import type { MailerPort, MailMessage } from './mailer-port.ts';

/** R1 local/test adapter: logs instead of sending (ADR-0011). */
export class LoggingMailer implements MailerPort {
  readonly #logger: Logger;

  constructor(logger: Logger) {
    this.#logger = logger;
  }

  send(message: MailMessage): Promise<void> {
    this.#logger.info(
      {
        mail: {
          to: message.to,
          subject: message.subject,
          textLength: message.text.length,
          hasHtml: message.html !== undefined,
        },
      },
      'mailer.stub.send',
    );
    return Promise.resolve();
  }
}
