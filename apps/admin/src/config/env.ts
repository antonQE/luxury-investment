import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.url().default('http://localhost:4000'),
});

export interface AdminEnv {
  apiUrl: string;
  isDev: boolean;
}

let cached: AdminEnv | undefined;

/** Only place that reads `import.meta.env`. */
export function env(): AdminEnv {
  cached ??= (() => {
    const parsed = envSchema.parse({
      VITE_API_URL: import.meta.env.VITE_API_URL,
    });
    return { apiUrl: parsed.VITE_API_URL, isDev: import.meta.env.DEV };
  })();
  return cached;
}
