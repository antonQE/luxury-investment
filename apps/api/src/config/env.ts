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
  API_CORS_ORIGINS: csv.default(['http://localhost:3000', 'http://localhost:5173']),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  /** Random string used to name/document session cookies; opaque tokens live in Postgres. */
  AUTH_SESSION_SECRET: z.string().min(16).default('local-dev-session-secret'),
  AUTH_COOKIE_NAME: z.string().min(1).default('li_session'),
  AUTH_SESSION_TTL_HOURS: z.coerce.number().int().positive().default(168),
  /** Local media root (ADR-0010). Relative paths resolve from the monorepo root when started via npm. */
  MEDIA_LOCAL_ROOT: z.string().min(1).default('.data/media'),
  /** Public base URL used to build media links (no trailing slash). */
  MEDIA_PUBLIC_BASE_URL: z.string().min(1).default('http://localhost:4000/v1/public/media'),
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
