import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
}

export function errorHandler(err: ApiError, _req: Request, res: Response, _next: NextFunction): void {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
    },
  });
}

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
