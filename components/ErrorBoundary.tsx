'use client';

import React from 'react';
import logger from '../lib/logger';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error({
      error: {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      },
    }, 'React component error');
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="text-red-800 text-lg font-semibold">Something went wrong</h2>
          <p className="text-red-600 mt-2">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
