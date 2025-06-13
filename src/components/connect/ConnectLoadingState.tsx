
import React from 'react';

interface ConnectLoadingStateProps {
  message?: string;
}

const ConnectLoadingState: React.FC<ConnectLoadingStateProps> = ({ 
  message = "Loading Professional Network..." 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-xl font-semibold mb-2">{message}</div>
        <div className="text-gray-600">Connecting you with the diaspora community</div>
      </div>
    </div>
  );
};

export default ConnectLoadingState;
