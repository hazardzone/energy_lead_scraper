import logger from './logger';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'UNKNOWN_ERROR',
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleApiError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  logger.error({ error }, 'Unhandled error occurred');
  
  if (error instanceof Error) {
    return new AppError(error.message, 'UNEXPECTED_ERROR', 500);
  }

  return new AppError('An unexpected error occurred', 'UNEXPECTED_ERROR', 500);
};

export const isNetworkError = (error: unknown): boolean => {
  return error instanceof Error && 
    ['NetworkError', 'NetworkRequestFailed'].includes(error.name);
};

export const formatErrorMessage = (error: unknown): string => {
  if (error instanceof AppError) {
    return `${error.code}: ${error.message}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
