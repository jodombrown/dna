
import React from 'react';

interface ConnectLoadingStateProps {
  message?: string;
}

const ConnectLoadingState: React.FC<ConnectLoadingStateProps> = ({ 
  message = "Loading Professional Network..." 
}) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="text-xl font-semibold mb-2 text-foreground">{message}</div>
        <div className="text-muted-foreground">Connecting you with the diaspora community</div>
      </div>
    </div>
  );
};

export default ConnectLoadingState;
