import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const guard = (res: { data: any; error: any }, friendly = 'Action failed') => {
  if (res.error) {
    console.error(res.error);
    throw new Error(friendly);
  }
  return res.data ?? [];
};

interface Space {
  id: string;
  created_by: string;
  title: string;
  description: string | null;
  visibility: 'private' | 'public';
  status: 'active' | 'archived';
  tags: string[] | null;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
}

interface Task {
  id: string;
  space_id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assignee_id?: string | null;
  due_date?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface Milestone {
  id: string;
  space_id: string;
  title: string;
  description: string | null;
  due_date?: string | null;
  status: 'planned' | 'in-progress' | 'completed';
  created_by: string;
  created_at: string;
  updated_at: string;
}

const Spaces: React.FC = () => {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<Space | null>(null);

  // create form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');
  const [tags, setTags] = useState('');

  // task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDue, setTaskDue] = useState('');

  // milestone form
  const [msTitle, setMsTitle] = useState('');
  const [msDue, setMsDue] = useState('');

  useEffect(() => {
    document.title = 'Collaboration Spaces | DNA';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Manage collaboration spaces, tasks, and milestones on the DNA platform.');
  }, []);

  const logContribution = async (payload: { user_id?: string; type: string; target_id: string; target_title?: string; metadata?: any }) => {
    try {
      console.debug('logContribution', payload);
    } catch (e) {
      console.warn('logContribution failed', e);
    }
  };

  const fetchSpaces = async () => {
    setLoading(true);
    const res = await supabase
      .from('collaboration_spaces')
      .select('*')
      .order('updated_at', { ascending: false });
    try {
      setSpaces(guard(res as any, 'Could not load spaces') as Space[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const visibleTags = useMemo(() => (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []), [tags]);

  const createSpace = async () => {
    if (!user || !title.trim()) return;
    setCreating(true);
    const { error } = await supabase.from('collaboration_spaces').insert({
      created_by: user.id,
      title: title.trim(),
      description: description.trim() || null,
      visibility,
      status: 'active',
      tags: visibleTags,
    });
    setCreating(false);
    if (!error) {
      setTitle('');
      setDescription('');
      setVisibility('private');
      setTags('');
      fetchSpaces();
    }
  };

  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  const fetchDetails = async (space: Space) => {
    setSelected(space);
    const [tasksRes, msRes] = await Promise.all([
      supabase.from('tasks').select('*').eq('space_id', space.id).order('updated_at', { ascending: false }),
      supabase.from('milestones').select('*').eq('space_id', space.id).order('updated_at', { ascending: false }),
    ]);
    setTasks(guard(tasksRes as any, "You do not have access to this space's tasks") as Task[]);
    setMilestones(guard(msRes as any, "You do not have access to this space's milestones") as Milestone[]);
  };

  useEffect(() => {
    if (!selected) return;
    const channel = supabase
      .channel(`space:${selected.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `space_id=eq.${selected.id}` }, () => fetchDetails(selected))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'milestones', filter: `space_id=eq.${selected.id}` }, () => fetchDetails(selected))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selected?.id]);

  const addTask = async () => {
    if (!user || !selected || !taskTitle.trim()) return;
    const { error } = await supabase.from('tasks').insert({
      space_id: selected.id,
      title: taskTitle.trim(),
      description: null,
      status: 'todo',
      priority: 'normal',
      assignee_id: user.id,
      due_date: taskDue || null,
      created_by: user.id,
    });
    if (!error) {
      setTaskTitle('');
      setTaskDue('');
      if (user && selected) {
        logContribution({ user_id: user.id, type: 'task', target_id: selected.id, target_title: taskTitle, metadata: { action: 'created' } });
      }
      fetchDetails(selected);
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    const next: Task['status'] = task.status === 'todo' ? 'in-progress' : task.status === 'in-progress' ? 'done' : 'todo';
    const { error } = await supabase.from('tasks').update({ status: next }).eq('id', task.id);
    if (!error && selected) {
      if (user) {
        logContribution({ user_id: user.id, type: 'task', target_id: task.id, metadata: { action: 'status_changed', to: next } });
      }
      fetchDetails(selected);
    }
  };

  const addMilestone = async () => {
    if (!user || !selected || !msTitle.trim()) return;
    const { error } = await supabase.from('milestones').insert({
      space_id: selected.id,
      title: msTitle.trim(),
      description: null,
      status: 'planned',
      due_date: msDue || null,
      created_by: user.id,
    });
    if (!error) {
      setMsTitle('');
      setMsDue('');
      if (user && selected) {
        logContribution({ user_id: user.id, type: 'milestone', target_id: selected.id, target_title: msTitle, metadata: { action: 'created' } });
      }
      fetchDetails(selected);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold text-dna-forest mb-4">Collaboration Spaces</h1>

      {/* Create Space */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create a new space</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Nairobi Healthtech Hub" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief purpose or scope" />
          </div>
          <div className="md:col-span-1">
            <Label>Visibility</Label>
            <Select value={visibility} onValueChange={(v) => setVisibility(v as 'private' | 'public')}>
              <SelectTrigger><SelectValue placeholder="Visibility" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-4">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="healthtech, kenya, early-stage" />
          </div>
          <div className="md:col-span-1 flex items-end">
            <Button onClick={createSpace} disabled={creating || !title.trim()} className="w-full">Create</Button>
          </div>
        </CardContent>
      </Card>

      {/* Spaces List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My & Public Spaces</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-500">Loading spaces…</p>
            ) : spaces.length === 0 ? (
              <p className="text-sm text-gray-500">No spaces yet.</p>
            ) : (
              <div className="space-y-3">
                {spaces.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => fetchDetails(s)}
                    className={`w-full text-left p-3 rounded border transition ${selected?.id === s.id ? 'border-dna-copper bg-dna-mint/20' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-dna-forest">{s.title}</p>
                        <p className="text-xs text-gray-600 line-clamp-1">{s.description}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${s.visibility === 'public' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{s.visibility}</span>
                    </div>
                    {s.tags && s.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {s.tags.map((t) => (
                          <span key={t} className="text-[10px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">{t}</span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle>{selected ? selected.title : 'Space details'}</CardTitle>
          </CardHeader>
          <CardContent>
            {!selected ? (
              <p className="text-sm text-gray-500">Select a space to manage tasks and milestones.</p>
            ) : (
              <div className="space-y-6">
                {/* Tasks */}
                <div>
                  <h3 className="text-sm font-medium text-dna-forest mb-2">Tasks</h3>
                  <div className="flex gap-2 mb-3">
                    <Input placeholder="Task title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
                    <Input type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} className="w-40" />
                    <Button onClick={addTask} disabled={!taskTitle.trim()}>Add</Button>
                  </div>
                  <div className="space-y-2">
                    {tasks.length === 0 && <p className="text-xs text-gray-500">No tasks yet.</p>}
                    {tasks.map((t) => (
                      <div key={t.id} className="p-2 border rounded flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-dna-forest">{t.title}</p>
                          <p className="text-xs text-gray-500">{t.status}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => toggleTaskStatus(t)}>Advance</Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Milestones */}
                <div>
                  <h3 className="text-sm font-medium text-dna-forest mb-2">Milestones</h3>
                  <div className="flex gap-2 mb-3">
                    <Input placeholder="Milestone title" value={msTitle} onChange={(e) => setMsTitle(e.target.value)} />
                    <Input type="date" value={msDue} onChange={(e) => setMsDue(e.target.value)} className="w-40" />
                    <Button onClick={addMilestone} disabled={!msTitle.trim()}>Add</Button>
                  </div>
                  <div className="space-y-2">
                    {milestones.length === 0 && <p className="text-xs text-gray-500">No milestones yet.</p>}
                    {milestones.map((m) => (
                      <div key={m.id} className="p-2 border rounded flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-dna-forest">{m.title}</p>
                          <p className="text-xs text-gray-500">{m.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Spaces;
