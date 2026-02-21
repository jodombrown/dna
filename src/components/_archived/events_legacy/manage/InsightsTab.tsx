import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';

interface InsightsTabProps { eventId: string; }

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString();

const InsightsTab: React.FC<InsightsTabProps> = ({ eventId }) => {
  const [regs, setRegs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: r } = await supabase
        .from('event_attendees')
        .select('created_at')
        .eq('event_id', eventId);
      setRegs(r || []);
      const { data: a } = await supabase
        .from('event_analytics')
        .select('happened_at, kind, payload')
        .eq('event_id', eventId);
      setAnalytics(a || []);
    })();
  }, [eventId]);

  const byDay = useMemo(() => {
    const map = new Map<string, { date: string; registrations: number }>();
    for (const r of regs) {
      const d = fmtDate(r.created_at);
      const item = map.get(d) || { date: d, registrations: 0 };
      item.registrations += 1;
      map.set(d, item);
    }
    return Array.from(map.values()).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [regs]);

  const conv = useMemo(() => {
    const views = analytics.filter(a => a.kind === 'page_view').length || 0;
    const paid = analytics.filter(a => a.kind === 'payment_success').length || 0;
    return views ? Math.round((paid / views) * 100) : 0;
  }, [analytics]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>Registrations by day</CardTitle></CardHeader>
        <CardContent style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={byDay}>
              <defs>
                <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="registrations" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorReg)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Total Registrations</CardTitle></CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{regs.length}</div>
          <p className="text-sm text-muted-foreground">Total attendees registered</p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Conversion rate</CardTitle></CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{conv}%</div>
          <p className="text-sm text-muted-foreground">payment_success divided by page_view</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsightsTab;
