import React from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ErrorFallback } from '@/components/ui/error-fallback';

interface PageErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const PageErrorBoundary: React.FC<PageErrorBoundaryProps> = ({
  children,
  fallbackTitle = "Page Error",
  fallbackMessage = "This page encountered an error. Please try refreshing or navigate back.",
  showBackButton = true,
  onBack
}) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-gray-50">
          <ErrorFallback
            title={fallbackTitle}
            message={fallbackMessage}
            showBackButton={showBackButton}
            onBack={onBack}
            className="min-h-screen"
          />
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};

// Specialized error boundary for authenticated pages
export const AppPageErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <PageErrorBoundary
      fallbackTitle="App Error"
      fallbackMessage="The application encountered an error. Your data is safe, please try refreshing the page."
      showBackButton={true}
      onBack={() => window.location.href = '/app'}
    >
      {children}
    </PageErrorBoundary>
  );
};

// Specialized error boundary for admin pages
export const AdminPageErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <PageErrorBoundary
      fallbackTitle="Admin Panel Error"
      fallbackMessage="The admin panel encountered an error. Please try refreshing or contact technical support."
      showBackButton={true}
      onBack={() => window.location.href = '/admin/dashboard'}
    >
      {children}
    </PageErrorBoundary>
  );
};