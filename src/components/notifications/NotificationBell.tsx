import React, { useEffect, useMemo, useState } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationRow {
  id: string;
  user_id: string;
  type: string | null;
  title: string | null;
  body: string | null;
  related_entity_id: string | null;
  related_entity_type: string | null;
  is_read: boolean | null;
  created_at: string;
}

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const userId = user?.id ?? null;

  const fetchData = async (uid: string) => {
    setLoading(true);
    try {
      const [listRes, countRes] = await Promise.all([
        supabase
          .from('notifications')
          .select('id,user_id,type,title,body,related_entity_id,related_entity_type,is_read,created_at')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(15),
        supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', uid)
          .eq('is_read', false),
      ]);
      if (listRes.error) throw listRes.error;
      if (countRes.error) throw countRes.error;
      setItems(listRes.data || []);
      setUnread(countRes.count ?? 0);
    } catch (e) {
      console.warn('Failed to load notifications', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchData(userId);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        const row = payload.new as NotificationRow;
        setItems((prev) => [row, ...prev].slice(0, 15));
        setUnread((u) => u + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAllAsRead = async () => {
    if (!userId || unread === 0) return;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (!error) setUnread(0);
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return '';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 px-1 py-0 text-[10px] leading-4">
              {unread > 99 ? '99+' : unread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={unread === 0} className="gap-2">
            <Check className="h-4 w-4" /> Mark all read
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="flex items-center gap-2 px-3 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="px-3 py-6 text-sm text-muted-foreground">No notifications yet</div>
        ) : (
          items.map((n) => (
            <DropdownMenuItem key={n.id} className="flex flex-col items-start py-3">
              <div className="w-full flex items-center justify-between gap-3">
                <span className="font-medium text-sm truncate">{n.title || n.type}</span>
                <span className="text-[10px] text-muted-foreground">{formatTime(n.created_at)}</span>
              </div>
              {n.body && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.body}</p>}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
