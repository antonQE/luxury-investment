import { z } from 'zod';

const csv = z.string().transform((value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(4000),
  API_LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  /** Browser origins allowed for CORS (public site + admin; used for /health etc.). */
  API_CORS_ORIGINS: csv.default(['http://localhost:3000', 'http://localhost:5173']),
  /** Origins allowed to mutate `/v1/admin` (CSRF: public site must not drive staff cookies). */
  API_ADMIN_CORS_ORIGINS: csv.default(['http://localhost:5173']),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  /** HMAC key for hashing opaque session tokens before storage (ADR-0012). */
  AUTH_SESSION_SECRET: z.string().min(16).default('local-dev-session-secret'),
  AUTH_COOKIE_NAME: z.string().min(1).default('li_session'),
  /** Staff session lifetime in hours (default one week; shorten in production if desired). */
  AUTH_SESSION_TTL_HOURS: z.coerce.number().int().positive().default(168),
  /** Local media root (ADR-0010). Relative paths resolve from the monorepo root when started via npm. */
  MEDIA_LOCAL_ROOT: z.string().min(1).default('.data/media'),
  /** Public base URL used to build media links (no trailing slash). */
  MEDIA_PUBLIC_BASE_URL: z.string().min(1).default('http://localhost:4000/v1/public/media'),
  /** Catch-all recipient for inquiry notifications until per-agent routing exists (ADR-0011). */
  INQUIRY_NOTIFY_TO: z.email().default('inquiries@example.com'),
  /**
   * Team member slug for the mortgage calculator CTA (CALC-003).
   * Only this profile should carry a credit-consultant qualification.
   */
  CREDIT_CONSULTANT_TEAM_SLUG: z.string().min(1).default('demo-credit-consultant'),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid API environment:\n${issues}`);
  }
  return result.data;
}
