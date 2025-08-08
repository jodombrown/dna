import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PAGE = 20;
const guard = (res: { data: any; error: any }, friendly = 'Action failed') => {
  if (res.error) {
    console.error(res.error);
    throw new Error(friendly);
  }
  return res.data ?? [];
};

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
  const [page, setPage] = useState(0);

  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'closed'>('all');
  const [type, setType] = useState<'all' | 'general' | 'funding' | 'mentorship' | 'job' | 'grant'>('all');

  useEffect(() => {
    document.title = 'Opportunities | DNA';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Browse active opportunities across the DNA network.');
  }, []);

  const fetchOpportunities = async (p = 0) => {
    setLoading(true);
    let query = supabase
      .from('opportunities')
      .select('*')
      .ilike('title', `%${q}%`)
      .order('created_at', { ascending: false })
      .range(p * PAGE, p * PAGE + PAGE - 1);

    if (status !== 'all') query = query.eq('status', status);
    if (type !== 'all') query = query.eq('type', type);

    const res = await query;
    try {
      setItems(guard(res, 'Could not load opportunities') as Opportunity[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchOpportunities(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, type]);

  useEffect(() => {
    const ch = supabase
      .channel('opps')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'opportunities' }, () => fetchOpportunities(page))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [page]);

  useEffect(() => {
    fetchOpportunities(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const data = items;

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
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-500">No opportunities match your filters.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((op) => (
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
