import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeQuery } from '@/hooks/useRealtimeQuery';
import { Loader2, Check, Trash2, AlertCircle, Info, AlertTriangle, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminNotification {
  id: string;
  admin_id: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  is_read: boolean;
  related_resource_type: string;
  related_resource_id: string;
  created_at: string;
  read_at: string;
}

export function NotificationsList() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Use real-time query for admin notifications
  const { data: notifications, loading, refetch } = useRealtimeQuery<AdminNotification>('admin-notifications-list', {
    table: 'admin_notifications',
    select: '*',
    filter: user ? `admin_id=eq.${user.id}` : undefined,
    orderBy: { column: 'created_at', ascending: false },
    enabled: !!user
  });

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('admin_id', user?.id);

      if (error) throw error;

      await refetch();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to update notification.",
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .delete()
        .eq('id', notificationId)
        .eq('admin_id', user?.id);

      if (error) throw error;

      await refetch();
      toast({
        title: "Notification Deleted",
        description: "Notification has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification.",
        variant: "destructive",
      });
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'default';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-dna-emerald" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card 
          key={notification.id} 
          className={`${!notification.is_read ? 'border-dna-emerald bg-green-50/30' : ''}`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {getSeverityIcon(notification.severity)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg">{notification.title}</CardTitle>
                    {!notification.is_read && (
                      <Badge variant="secondary" className="text-xs">New</Badge>
                    )}
                    <Badge variant={getSeverityBadgeVariant(notification.severity)}>
                      {notification.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(notification.created_at).toLocaleString()}
                    {notification.related_resource_type && (
                      <span className="ml-2">
                        • Related to: {notification.related_resource_type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!notification.is_read && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Mark Read
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteNotification(notification.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
      
      {notifications.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No notifications</h3>
              <p>You're all caught up! No new admin notifications at this time.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}