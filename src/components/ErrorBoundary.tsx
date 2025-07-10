import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { errorLogger } from '@/services/errorLogger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  eventId: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log the error to our centralized service
    errorLogger.logReactError(error, errorInfo);

    this.setState({
      error,
      errorInfo,
      eventId: Date.now().toString() // Simple event ID for tracking
    });

    // Also log to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error info:', errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    });
    
    // Call custom reset handler if provided
    this.props.onReset?.();
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 text-red-500">
                <AlertTriangle className="h-12 w-12" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                We've encountered an unexpected error. Our team has been notified and will look into this issue.
              </p>
              
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-4">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto max-h-32">
                    <div className="font-semibold">Error:</div>
                    <div className="mb-2">{this.state.error.message}</div>
                    <div className="font-semibold">Stack:</div>
                    <div className="whitespace-pre-wrap">{this.state.error.stack}</div>
                  </div>
                </details>
              )}

              {this.state.eventId && (
                <p className="text-xs text-gray-400 text-center">
                  Error ID: {this.state.eventId}
                </p>
              )}

              <div className="flex flex-col space-y-2">
                <Button 
                  onClick={this.handleReset}
                  className="w-full bg-dna-emerald hover:bg-dna-emerald/90 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                
                <Button 
                  onClick={this.handleReload}
                  variant="outline"
                  className="w-full"
                >
                  Reload Page
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="ghost"
                  className="w-full"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;