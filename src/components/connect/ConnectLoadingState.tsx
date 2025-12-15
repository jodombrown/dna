import React from 'react';
import AfricaSpinner from '@/components/ui/AfricaSpinner';

interface ConnectLoadingStateProps {
  message?: string;
}

const ConnectLoadingState: React.FC<ConnectLoadingStateProps> = ({ 
  message = "Connecting you with the diaspora community" 
}) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <AfricaSpinner size="lg" showText text={message} />
    </div>
  );
};

export default ConnectLoadingState;
