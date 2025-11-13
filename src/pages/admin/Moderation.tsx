import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function Moderation() {
  const { data: flags, refetch } = useQuery({
    queryKey: ['flags'],
    queryFn: async () => {
      const { data } = await supabase.from('content_flags').select('*, reporter_profile:profiles!flagged_by(username, full_name)').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const resolve = async (id: string) => {
    await supabase.from('content_flags').update({ resolved_at: new Date().toISOString() }).eq('id', id);
    toast.success('Resolved');
    refetch();
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Content Moderation</h1>
      <div className="space-y-4">
        {flags?.map(f => (
          <Card key={f.id}>
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle className="text-lg">{f.content_type} Report</CardTitle>
                <Badge variant={f.resolved_at ? 'default' : 'destructive'}>{f.resolved_at ? <><CheckCircle className="h-3 w-3 mr-1" />Resolved</> : <><AlertCircle className="h-3 w-3 mr-1" />Open</>}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{format(new Date(f.created_at), 'PPp')}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm"><strong>Reporter:</strong> {f.reporter_profile?.full_name}</p>
              {f.reason && <p className="text-sm p-3 bg-muted rounded">{f.reason}</p>}
              {!f.resolved_at && <Button size="sm" onClick={() => resolve(f.id)}>Resolve</Button>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
