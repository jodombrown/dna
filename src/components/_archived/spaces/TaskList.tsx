import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import AssigneeSelect from './AssigneeSelect';
import TaskComments from './TaskComments';

export default function TaskList({ spaceId }: { spaceId: string }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [priority, setPriority] = useState('normal');
  const [filter, setFilter] = useState<'all'|'todo'|'in-progress'|'done'>('all');

  const load = async () => {
    const { data } = await supabase.from('tasks').select('*').eq('space_id', spaceId).order('updated_at', { ascending: false });
    setTasks(data || []);
  };
  useEffect(() => { load();
    const ch = supabase.channel(`tasks:${spaceId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `space_id=eq.${spaceId}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [spaceId]);

  const createTask = async () => {
    const text = title.trim(); if (!text) return;
    const { error } = await supabase.rpc('rpc_task_create', { p_space: spaceId, p_title: text, p_description: null, p_due: due || null, p_priority: priority });
    if (!error) { setTitle(''); setDue(''); setPriority('normal'); }
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.rpc('rpc_task_set_status', { p_task: id, p_status: status });
  };

  const updateDue = async (id: string, date: string) => {
    await supabase.rpc('rpc_task_update', { p_task: id, p_due: date || null });
  };

  const updatePriority = async (id: string, p: string) => {
    await supabase.rpc('rpc_task_update', { p_task: id, p_priority: p });
  };

  const assign = async (id: string, uid: string) => {
    await supabase.rpc('rpc_task_assign', { p_task: id, p_assignee: uid });
  };

  const data = tasks.filter(t => filter === 'all' ? true : t.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <Input className="w-80" placeholder="New task title" value={title} onChange={e=>setTitle(e.target.value)} />
        <Input type="date" className="w-40" value={due} onChange={e=>setDue(e.target.value)} />
        <Select value={priority} onValueChange={v=>setPriority(v)}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={createTask}>Add</Button>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs">Filter</span>
          <Select value={filter} onValueChange={v=>setFilter(v as any)}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="todo">To do</SelectItem>
              <SelectItem value="in-progress">In progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        {data.length === 0 ? <div className="text-sm text-muted-foreground">No tasks yet.</div> : data.map(t => (
          <div key={t.id} className="p-3 border rounded space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-medium flex-1">{t.title}</div>
              <Select value={t.status} onValueChange={v=>updateStatus(t.id, v)}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To do</SelectItem>
                  <SelectItem value="in-progress">In progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
              <Select value={t.priority} onValueChange={v=>updatePriority(t.id, v)}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" className="w-40" value={t.due_date || ''} onChange={e=>updateDue(t.id, e.target.value)} />
              <AssigneeSelect spaceId={spaceId} value={t.assignee_id} onChange={uid=>assign(t.id, uid)} />
            </div>
            <TaskComments taskId={t.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
