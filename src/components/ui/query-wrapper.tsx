import React from 'react';
import { ErrorFallback, LoadingFallback, EmptyStateFallback } from './error-fallback';
import { AlertTriangle, Database } from 'lucide-react';

interface QueryWrapperProps {
  loading: boolean;
  error: string | null;
  data: any[];
  children: React.ReactNode;
  emptyMessage?: string;
  emptyTitle?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  loadingMessage?: string;
  errorTitle?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  className?: string;
}

export const QueryWrapper: React.FC<QueryWrapperProps> = ({
  loading,
  error,
  data,
  children,
  emptyMessage = "No items found",
  emptyTitle = "Nothing here yet",
  emptyActionLabel,
  onEmptyAction,
  loadingMessage = "Loading...",
  errorTitle = "Failed to load data",
  showRetry = true,
  onRetry,
  className = ""
}) => {
  if (loading) {
    return (
      <LoadingFallback 
        message={loadingMessage} 
        className={className}
      />
    );
  }

  if (error) {
    return (
      <ErrorFallback
        title={errorTitle}
        message={error}
        showRetryButton={showRetry}
        resetError={onRetry}
        showHomeButton={false}
        className={className}
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyStateFallback
        icon={<Database className="h-12 w-12" />}
        title={emptyTitle}
        message={emptyMessage}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
        className={className}
      />
    );
  }

  return <>{children}</>;
};

// Specialized wrapper for real-time queries
interface RealtimeQueryWrapperProps extends Omit<QueryWrapperProps, 'data'> {
  data: any[] | any;
  isEmpty?: (data: any) => boolean;
}

export const RealtimeQueryWrapper: React.FC<RealtimeQueryWrapperProps> = ({
  data,
  isEmpty,
  ...props
}) => {
  // Handle both array and object data
  const isDataEmpty = isEmpty ? isEmpty(data) : (Array.isArray(data) ? data.length === 0 : !data);
  const dataArray = Array.isArray(data) ? data : [data].filter(Boolean);
  
  return (
    <QueryWrapper
      {...props}
      data={isDataEmpty ? [] : dataArray}
    />
  );
};