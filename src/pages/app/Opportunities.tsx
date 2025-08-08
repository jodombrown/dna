import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Opportunity {
  id: string;
  created_by: string;
  space_id?: string | null;
  title: string;
  description: string | null;
  type: string;
  status: 'active' | 'closed';
  visibility: 'public' | 'private';
  tags: string[] | null;
  location?: string | null;
  link?: string | null;
  image_url?: string | null;
  created_at: string;
}

const Opportunities: React.FC = () => {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'closed'>('all');
  const [type, setType] = useState<'all' | 'general' | 'funding' | 'mentorship' | 'job' | 'grant'>('all');

  useEffect(() => {
    document.title = 'Opportunities | DNA';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Browse active opportunities across the DNA network.');
  }, []);

  const fetchOpportunities = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setItems((data as Opportunity[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (status !== 'all' && it.status !== status) return false;
      if (type !== 'all' && it.type !== type) return false;
      if (q && !(`${it.title} ${it.description || ''} ${(it.tags || []).join(' ')}`.toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    });
  }, [items, q, status, type]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold text-dna-forest mb-4">Opportunities</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <Input placeholder="Search opportunities" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select value={status} onValueChange={(v) => setStatus(v as any)}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={(v) => setType(v as any)}>
          <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="funding">Funding</SelectItem>
            <SelectItem value="mentorship">Mentorship</SelectItem>
            <SelectItem value="job">Job</SelectItem>
            <SelectItem value="grant">Grant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-500">No opportunities match your filters.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((op) => (
                <div key={op.id} className="border rounded p-4 hover:border-dna-copper transition">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-dna-forest">{op.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${op.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{op.status}</span>
                  </div>
                  {op.tags && op.tags.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {op.tags.map((t) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">{t}</span>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-gray-600 line-clamp-3">{op.description}</p>
                  {op.link && (
                    <a href={op.link} target="_blank" rel="noreferrer" className="text-sm text-dna-copper underline mt-2 inline-block">Open</a>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Opportunities;
