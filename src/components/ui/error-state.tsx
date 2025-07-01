
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  showIcon?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
  showIcon = true
}) => {
  return (
    <Card className="border-red-200">
      <CardContent className="pt-6">
        <div className="text-center py-8">
          {showIcon && (
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          )}
          <h3 className="text-lg font-semibold text-red-900 mb-2">{title}</h3>
          <p className="text-red-600 mb-6">{message}</p>
          {onRetry && (
            <Button 
              onClick={onRetry}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {retryLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
