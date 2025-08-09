import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function BadgeWidget({ userId }: { userId: string }) {
  const [items, setItems] = useState<any[]>([]);
  
  const load = async () => {
    const { data } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setItems(data || []);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`badges:${userId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'user_badges', 
        filter: `user_id=eq.${userId}` 
      }, load)
      .subscribe();
    return () => { 
      supabase.removeChannel(ch); 
    };
  }, [userId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Badges</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No badges yet. Keep contributing to earn recognition.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {items.map(b => (
              <div key={b.id} className="p-3 border rounded-lg bg-background/50">
                <div className="flex items-center gap-2 mb-1">
                  {b.icon && <span className="text-lg">{b.icon}</span>}
                  <div className="text-sm font-medium truncate">
                    {b.badge_name || b.badge_type}
                  </div>
                </div>
                {b.description && (
                  <div className="text-xs text-muted-foreground mb-2">
                    {b.description}
                  </div>
                )}
                <div className="text-[11px] text-muted-foreground">
                  {new Date(b.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}