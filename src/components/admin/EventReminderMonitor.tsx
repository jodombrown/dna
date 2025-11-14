import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function EventReminderMonitor() {
  const { data: cronLogs, isLoading } = useQuery({
    queryKey: ['cron-job-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cron_job_logs')
        .select('*')
        .eq('job_name', 'send-event-reminders')
        .order('started_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: stats } = useQuery({
    queryKey: ['reminder-stats'],
    queryFn: async () => {
      // Get last 24 hours stats
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { data, error } = await supabase
        .from('event_reminder_logs')
        .select('id, sent_at')
        .gte('sent_at', oneDayAgo.toISOString());

      if (error) throw error;

      return {
        total_24h: data?.length || 0,
      };
    },
    refetchInterval: 30000,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'success' ? 'default' : status === 'error' ? 'destructive' : 'secondary';
    return <Badge variant={variant}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Reminder Monitor</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const lastRun = cronLogs?.[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last Run Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {lastRun && getStatusIcon(lastRun.status)}
              <span className="text-2xl font-bold">
                {lastRun ? getStatusBadge(lastRun.status) : 'No runs yet'}
              </span>
            </div>
            {lastRun?.started_at && (
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(lastRun.started_at), { addSuffix: true })}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last Run Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastRun?.reminders_sent || 0} reminders
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {lastRun?.events_processed || 0} events processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last 24 Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.total_24h || 0} reminders
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sent in the last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Job Executions</CardTitle>
          <CardDescription>Last 20 automated reminder job runs</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Reminders</TableHead>
                <TableHead>Errors</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cronLogs && cronLogs.length > 0 ? (
                cronLogs.map((log) => {
                  const duration = log.completed_at && log.started_at
                    ? Math.round((new Date(log.completed_at).getTime() - new Date(log.started_at).getTime()) / 1000)
                    : null;

                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          {getStatusBadge(log.status)}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatDistanceToNow(new Date(log.started_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-xs">
                        {duration !== null ? `${duration}s` : '-'}
                      </TableCell>
                      <TableCell>{log.events_processed || 0}</TableCell>
                      <TableCell className="font-medium">{log.reminders_sent || 0}</TableCell>
                      <TableCell>
                        {log.error_message ? (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertCircle className="h-3 w-3" />
                            <span className="text-xs truncate max-w-[200px]" title={log.error_message}>
                              {log.error_message}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No job executions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
