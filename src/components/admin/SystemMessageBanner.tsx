import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-react';

interface SystemMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  dismissible: boolean;
  active: boolean;
  created_at: string;
}

export function SystemMessageBanner() {
  const [messages, setMessages] = useState<SystemMessage[]>([]);
  const [dismissedMessages, setDismissedMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, we'll use mock data since we don't have a system_messages table
    // In a real app, you'd fetch from Supabase
    const mockMessages: SystemMessage[] = [
      {
        id: '1',
        type: 'info',
        title: 'Platform Status',
        message: 'All systems are operational. Admin portal is ready for use.',
        dismissible: true,
        active: true,
        created_at: new Date().toISOString()
      }
    ];

    // Simulate API call delay
    setTimeout(() => {
      setMessages(mockMessages);
      setLoading(false);
    }, 500);
  }, []);

  const dismissMessage = (messageId: string) => {
    setDismissedMessages(prev => [...prev, messageId]);
  };

  const getMessageIcon = (type: SystemMessage['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      case 'info':
        return <Info className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getAlertVariant = (type: SystemMessage['type']) => {
    switch (type) {
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getAlertColors = (type: SystemMessage['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="mb-6">
        <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  const activeMessages = messages.filter(
    msg => msg.active && !dismissedMessages.includes(msg.id)
  );

  if (activeMessages.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 space-y-3">
      {activeMessages.map((message) => (
        <Alert 
          key={message.id} 
          variant={getAlertVariant(message.type)}
          className={`${getAlertColors(message.type)} border-l-4`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getMessageIcon(message.type)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">{message.title}</h4>
                <AlertDescription className="text-sm">
                  {message.message}
                </AlertDescription>
              </div>
            </div>
            {message.dismissible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissMessage(message.id)}
                className="flex-shrink-0 p-1 h-auto hover:bg-white/50"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Alert>
      ))}
    </div>
  );
}