import { createInquirySchema } from '@luxury-investment/shared';
import { Router } from 'express';

import type { MailerPort } from '../../../infrastructure/mailer/mailer-port.ts';
import { createRateLimiter } from '../../../infrastructure/server/middleware/rate-limit.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { Logger } from '../../../utils/logger.ts';
import type { InquiryRepo } from '../repo/inquiry-repo.ts';

export function inquiryPublicRouter(
  repo: InquiryRepo,
  mailer: MailerPort,
  notifyTo: string,
  logger: Logger,
): Router {
  const router = Router();
  const rateLimit = createRateLimiter({ windowMs: 60_000, max: 10 });

  router.post(
    '/inquiries',
    rateLimit,
    withValidation({ body: createInquirySchema }, async ({ body }, _req, res) => {
      // Honeypot already enforced by schema (`website` max length 0).
      const created = await repo.create(body);
      try {
        await mailer.send({
          to: notifyTo,
          subject: `[LI] New ${body.type}: ${body.propertySlug}`,
          text: [
            `Inquiry id: ${created.id}`,
            `Type: ${body.type}`,
            `Property: ${body.propertySlug}`,
            `From: ${body.name} <${body.email}>`,
            `Phone: ${body.phone}`,
            '',
            body.message,
          ].join('\n'),
        });
      } catch (error) {
        logger.error({ err: error, inquiryId: created.id }, 'inquiry.notify.failed');
      }
      res.status(201).json({ data: { id: created.id } });
    }),
  );

  return router;
}
