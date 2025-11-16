import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function BadgeToastListener() {
  useEffect(() => {
    const ch = supabase
      .channel(`badge-toasts-${Date.now()}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications', 
        filter: `type=eq.badge_awarded` 
      }, (p) => {
        const row: any = p.new;
        const b = row?.payload || {};
        toast.success(`🎉 Badge earned: ${b.badge_name || b.badge_key}`, {
          description: b.description || 'Great work!',
          duration: 5000,
        });
      });

    try {
      const anyCh: any = ch as any;
      if (anyCh.state !== 'joined' && anyCh.state !== 'joining') {
        ch.subscribe();
      }
    } catch (err: any) {
      if (!String(err?.message || '').includes("subscribe' can only be called a single time")) {
        console.error('Badge toasts subscribe failed', err);
      }
    }

    return () => { 
      supabase.removeChannel(ch); 
    };
  }, []);
  
  return null;
}