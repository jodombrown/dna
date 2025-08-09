import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function TaskComments({ taskId }: { taskId: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [body, setBody] = useState('');
  const load = async () => {
    const { data } = await supabase.from('task_comments').select('*').eq('task_id', taskId).order('created_at', { ascending: true });
    setItems(data || []);
  };
  useEffect(() => { load();
    const ch = supabase.channel(`taskc:${taskId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'task_comments', filter: `task_id=eq.${taskId}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [taskId]);
  const submit = async () => {
    const text = body.trim(); if (!text) return;
    await supabase.rpc('rpc_task_comment', { p_task: taskId, p_body: text });
    setBody('');
  };
  return (
    <div className="space-y-2">
      <div className="font-medium text-sm">Comments</div>
      <div className="space-y-1 max-h-56 overflow-auto">
        {items.map(c => (
          <div key={c.id} className="text-sm border rounded p-2">
            <div className="text-[11px] text-muted-foreground">{new Date(c.created_at).toLocaleString()}</div>
            <div>{c.body}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={body} onChange={e=>setBody(e.target.value)} placeholder="Add a comment" />
        <Button onClick={submit}>Send</Button>
      </div>
    </div>
  );
}
