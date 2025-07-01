
import React from 'react';
import { ErrorState } from '@/components/ui/error-state';

interface ConnectErrorStateProps {
  error: string;
  onRetry: () => void;
}

const ConnectErrorState: React.FC<ConnectErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <ErrorState
          title="Failed to Load Network"
          message={error || "We're having trouble connecting to the diaspora network. Please check your connection and try again."}
          onRetry={onRetry}
          retryLabel="Reconnect to Network"
        />
      </div>
    </div>
  );
};

export default ConnectErrorState;
