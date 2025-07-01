
import React from 'react';
import { LoadingState } from '@/components/ui/loading-state';

interface ConnectLoadingStateProps {
  message?: string;
}

const ConnectLoadingState: React.FC<ConnectLoadingStateProps> = ({ 
  message = "Loading diaspora network..." 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md">
        <LoadingState 
          size="lg"
          message={message}
        />
        <p className="text-gray-500 mt-4 text-sm">
          Connecting you with professionals, communities, and events worldwide
        </p>
      </div>
    </div>
  );
};

export default ConnectLoadingState;
