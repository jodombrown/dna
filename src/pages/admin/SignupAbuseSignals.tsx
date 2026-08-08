import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';

type SignalAction = 'blocked' | 'flagged';

interface SignupAbuseSignal {
  id: string;
  created_at: string;
  source: string;
  signal_type: string;
  action: SignalAction;
  email_domain: string | null;
  event_id: string | null;
}

const actionBadgeVariant: Record<SignalAction, 'destructive' | 'warning'> = {
  blocked: 'destructive',
  flagged: 'warning',
};

export default function SignupAbuseSignals() {
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const { data: signals, isLoading } = useQuery({
    queryKey: ['signup-abuse-signals', sourceFilter, actionFilter],
    queryFn: async () => {
      let query = supabase
        .from('signup_abuse_signals')
        .select('id, created_at, source, signal_type, action, email_domain, event_id')
        .order('created_at', { ascending: false })
        .limit(200);

      if (sourceFilter !== 'all') {
        query = query.eq('source', sourceFilter);
      }
      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SignupAbuseSignal[];
    },
    staleTime: 30000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Signup Abuse Signals</h1>
        <p className="text-muted-foreground">
          Disposable-domain blocks and IP-pattern flags from guest RSVP registration
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Recent Signals</CardTitle>
              <CardDescription>Read-only. Most recent 200 signals.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="guest_rsvp">Guest RSVP</SelectItem>
                </SelectContent>
              </Select>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Created</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Signal Type</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Email Domain</TableHead>
                    <TableHead>Event</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signals?.map((signal) => (
                    <TableRow key={signal.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(signal.created_at), 'MMM d, HH:mm:ss')}
                      </TableCell>
                      <TableCell className="text-sm">{signal.source}</TableCell>
                      <TableCell className="text-sm">{signal.signal_type}</TableCell>
                      <TableCell>
                        <Badge variant={actionBadgeVariant[signal.action]} className="capitalize">
                          {signal.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {signal.email_domain || '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {signal.event_id ? (
                          <Link to={`/event/${signal.event_id}`} className="text-primary hover:underline">
                            View event
                          </Link>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {signals?.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                  <ShieldAlert className="h-8 w-8" />
                  <p>No signals found matching your filters</p>
                </div>
              )}
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
