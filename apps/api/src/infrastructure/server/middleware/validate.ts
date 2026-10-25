import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { z } from 'zod';

import { AppError } from '../../../errors/app-error.ts';

interface RequestSchemas {
  params?: z.ZodType;
  query?: z.ZodType;
  body?: z.ZodType;
}

type Infer<T> = T extends z.ZodType ? z.infer<T> : undefined;

export interface ValidatedInput<S extends RequestSchemas> {
  params: Infer<S['params']>;
  query: Infer<S['query']>;
  body: Infer<S['body']>;
}

type ValidatedHandler<S extends RequestSchemas> = (
  input: ValidatedInput<S>,
  req: Request,
  res: Response,
) => Promise<void> | void;

const PARTS = ['params', 'query', 'body'] as const;

/**
 * Validates params, query and body with zod before the handler runs.
 * Express 5 makes `req.query` read-only, so parsed values are passed to the handler instead of
 * being written back to the request.
 */
export function withValidation<S extends RequestSchemas>(
  schemas: S,
  handler: ValidatedHandler<S>,
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const input: Record<string, unknown> = {};
    const issues: { location: string; path: string; message: string }[] = [];

    for (const part of PARTS) {
      const schema = schemas[part];
      if (schema === undefined) continue;
      const result = schema.safeParse(req[part]);
      if (result.success) {
        input[part] = result.data;
      } else {
        for (const issue of result.error.issues) {
          issues.push({ location: part, path: issue.path.join('.'), message: issue.message });
        }
      }
    }

    if (issues.length > 0) {
      next(new AppError('VALIDATION_FAILED', undefined, issues));
      return;
    }

    await handler(input as unknown as ValidatedInput<S>, req, res);
  };
}
