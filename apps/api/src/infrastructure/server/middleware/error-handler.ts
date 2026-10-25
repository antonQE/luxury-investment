import type { ErrorRequestHandler, RequestHandler } from 'express';

import { AppError } from '../../../errors/app-error.ts';
import type { Logger } from '../../../utils/logger.ts';

interface ErrorBody {
  error: { code: string; message: string; details?: unknown };
}

function isMalformedJson(error: unknown): boolean {
  return error instanceof SyntaxError && 'type' in error && error.type === 'entity.parse.failed';
}

export const notFoundHandler: RequestHandler = () => {
  throw new AppError('NOT_FOUND');
};

export function createErrorHandler(logger: Logger): ErrorRequestHandler {
  return (error: unknown, _req, res, _next) => {
    const appError =
      error instanceof AppError
        ? error
        : isMalformedJson(error)
          ? new AppError('VALIDATION_FAILED', 'The request body is not valid JSON.')
          : null;

    if (appError === null) {
      logger.error({ err: error }, 'Unhandled error');
      const body: ErrorBody = { error: { code: 'INTERNAL', message: 'Something went wrong.' } };
      res.status(500).json(body);
      return;
    }

    if (appError.status >= 500) logger.error({ err: appError }, appError.message);
    const body: ErrorBody = {
      error: {
        code: appError.code,
        message: appError.message,
        ...(appError.details === undefined ? {} : { details: appError.details }),
      },
    };
    res.status(appError.status).json(body);
  };
}
