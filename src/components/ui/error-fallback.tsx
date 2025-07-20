import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

interface ErrorFallbackProps {
  error?: Error | null;
  resetError?: () => void;
  title?: string;
  message?: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  showRetryButton?: boolean;
  onBack?: () => void;
  className?: string;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  title = "Something went wrong",
  message = "We've encountered an unexpected error. Please try again or contact support if the problem persists.",
  showHomeButton = true,
  showBackButton = false,
  showRetryButton = true,
  onBack,
  className = ""
}) => {
  const handleRefresh = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-red-500">
            <AlertTriangle className="h-12 w-12" />
          </div>
          <CardTitle className="text-lg font-semibold text-dna-forest">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            {message}
          </p>
          
          {import.meta.env.DEV && error && (
            <details className="mt-4">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                Error Details (Development)
              </summary>
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto max-h-32">
                <div className="font-semibold">Error:</div>
                <div className="mb-2">{error.message}</div>
                {error.stack && (
                  <>
                    <div className="font-semibold">Stack:</div>
                    <div className="whitespace-pre-wrap">{error.stack}</div>
                  </>
                )}
              </div>
            </details>
          )}

          <div className="flex flex-col space-y-2">
            {showRetryButton && (
              <Button 
                onClick={handleRefresh}
                className="w-full bg-dna-emerald hover:bg-dna-emerald/90 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            
            {showBackButton && (
              <Button 
                onClick={handleGoBack}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            )}
            
            {showHomeButton && (
              <Button 
                onClick={handleGoHome}
                variant="ghost"
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Loading fallback component
interface LoadingFallbackProps {
  message?: string;
  className?: string;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = "Loading...",
  className = ""
}) => {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-dna-emerald mb-4"></div>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
};

// Empty state fallback component
interface EmptyStateFallbackProps {
  icon?: React.ReactNode;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyStateFallback: React.FC<EmptyStateFallbackProps> = ({
  icon,
  title = "No data found",
  message = "There's nothing here yet. Try creating some content or adjusting your filters.",
  actionLabel,
  onAction,
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      {icon && (
        <div className="mb-4 text-gray-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-dna-forest mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4 max-w-md">{message}</p>
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          className="bg-dna-emerald hover:bg-dna-emerald/90"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};