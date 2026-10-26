import 'server-only';

import { z } from 'zod';

const serverEnvSchema = z.object({
  API_URL: z.url().default('http://localhost:4000'),
  SITE_URL: z.url().default('http://localhost:3000'),
  /** Optional GA4 measurement id; analytics load only after cookie consent. */
  NEXT_PUBLIC_GA4_MEASUREMENT_ID: z.string().optional().default(''),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

/** Server-only configuration; never imported by client components. */
export function serverEnv(): ServerEnv {
  cached ??= serverEnvSchema.parse({
    API_URL: process.env.API_URL,
    SITE_URL: process.env.SITE_URL,
    NEXT_PUBLIC_GA4_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID,
  });
  return cached;
}
