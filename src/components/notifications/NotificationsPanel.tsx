import React, { useEffect, useState, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Check } from 'lucide-react';

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

export default function NotificationsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [items, setItems] = useState<NotificationRow[]>([]);
  const [unread, setUnread] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('id,user_id,type,title,body,related_entity_id,related_entity_type,is_read,created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      const rows = data || [];
      setItems(rows);
      setUnread(rows.filter((r) => !r.is_read).length);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (open) {
      load();
    }
  }, [open, load]);

  useEffect(() => {
    if (!userId) return;
    const ch = supabase
      .channel(`notifications-panel-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, load)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [userId, load]);

  const markAllRead = async () => {
    if (!userId || unread === 0) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
    await load();
  };

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    await load();
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return '';
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-2xl font-bold">Notifications {unread ? `(${unread})` : ''}</SheetTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={markAllRead} disabled={unread === 0} className="gap-2">
                  <Check className="h-4 w-4" /> Mark all read
                </Button>
                <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
              </div>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 px-6">
            {loading ? (
              <div className="flex items-center gap-2 px-1 py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : items.length === 0 ? (
              <div className="px-1 py-6 text-sm text-muted-foreground">No notifications yet</div>
            ) : (
              <div className="space-y-3 py-6">
                {items.map((n) => (
                  <div key={n.id} className={`p-3 rounded-md border ${n.is_read ? 'opacity-70' : ''}`}>
                    <div className="w-full flex items-center justify-between gap-3">
                      <span className="font-medium text-sm truncate">{n.title || n.type}</span>
                      <span className="text-[10px] text-muted-foreground">{formatTime(n.created_at)}</span>
                    </div>
                    {n.body && <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{n.body}</p>}
                    {!n.is_read && (
                      <div className="mt-2">
                        <Button size="sm" variant="secondary" onClick={() => markRead(n.id)}>Mark read</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
