import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

export const RealtimeStatus: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [lastActivity, setLastActivity] = useState<string>('');

  useEffect(() => {
    // Test real-time connection with a simple channel
    const testChannel = supabase
      .channel('realtime-test')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts'
      }, (payload) => {
        console.log('Real-time test received:', payload);
        setLastActivity(new Date().toLocaleTimeString());
      })
      .subscribe((status) => {
        console.log('Real-time test status:', status);
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setConnectionStatus('disconnected');
        } else {
          setConnectionStatus('connecting');
        }
      });

    return () => {
      supabase.removeChannel(testChannel);
    };
  }, []);

  const statusColor = {
    connecting: 'yellow',
    connected: 'green',
    disconnected: 'red'
  }[connectionStatus];

  const StatusIcon = connectionStatus === 'connected' ? Wifi : WifiOff;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Badge variant="outline" className={`bg-${statusColor}-50 text-${statusColor}-700 border-${statusColor}-200`}>
        <StatusIcon className="h-3 w-3 mr-1" />
        {connectionStatus}
      </Badge>
      {lastActivity && (
        <span className="text-xs">
          Last: {lastActivity}
        </span>
      )}
    </div>
  );
};