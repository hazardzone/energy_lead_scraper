'use client';

import { useEffect } from 'react';
import logger from '../lib/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error({
      error: {
        message: error.message,
        stack: error.stack,
        digest: error.digest,
      },
    }, 'Global error boundary caught error');
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h1>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
