import React from 'react';
import { Button } from '@/components/ui/button';
import { useErrorHandler } from '@/hooks/useErrorHandler';

// Example component demonstrating error handling patterns
const ErrorHandlingExample: React.FC = () => {
  const { handleError, handleNetworkError, reportError } = useErrorHandler();

  const simulateJavaScriptError = () => {
    try {
      // This will throw an error
      (null as any).nonExistentMethod();
    } catch (error) {
      handleError(error as Error, { context: 'simulateJavaScriptError' });
    }
  };

  const simulateNetworkError = async () => {
    try {
      const response = await fetch('/api/nonexistent-endpoint');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      handleNetworkError(error, 'simulateNetworkError');
    }
  };

  const simulateCustomError = () => {
    reportError('User attempted an unsupported operation', {
      feature: 'error-handling-demo',
      userAction: 'custom-error-simulation'
    });
  };

  const simulateUncaughtError = () => {
    // This will be caught by global error handlers
    setTimeout(() => {
      throw new Error('Uncaught async error for testing');
    }, 100);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Error Handling Demo</h2>
      <div className="space-y-2">
        <Button onClick={simulateJavaScriptError} variant="destructive" size="sm">
          Simulate JS Error
        </Button>
        <Button onClick={simulateNetworkError} variant="destructive" size="sm">
          Simulate Network Error
        </Button>
        <Button onClick={simulateCustomError} variant="destructive" size="sm">
          Simulate Custom Error
        </Button>
        <Button onClick={simulateUncaughtError} variant="destructive" size="sm">
          Simulate Uncaught Error
        </Button>
      </div>
    </div>
  );
};

export default ErrorHandlingExample;