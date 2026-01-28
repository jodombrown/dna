import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Loader2, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  RefreshCw,
  TrendingUp,
  Clock,
  Filter,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { format, formatDistanceToNow, subDays } from 'date-fns';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type ErrorSeverity = 'critical' | 'error' | 'warning';
type TimeRange = '24h' | '7d' | '30d' | 'all';

interface ErrorLog {
  id: string;
  error_message: string;
  error_type: string;
  error_stack: string | null;
  severity: ErrorSeverity;
  url: string;
  user_agent: string;
  user_id: string | null;
  created_at: string;
  metadata: {
    category?: string;
    context?: string;
    [key: string]: unknown;
  };
}

interface ErrorSummary {
  severity: ErrorSeverity;
  count: number;
  first_seen: string;
  last_seen: string;
}

interface CategoryCount {
  category: string | null;
  count: number;
}

interface TopError {
  error_message: string;
  occurrences: number;
  last_seen: string;
}

const severityConfig: Record<ErrorSeverity, { icon: typeof AlertCircle; color: string; bgColor: string }> = {
  critical: { icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  error: { icon: AlertTriangle, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  warning: { icon: Info, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
};

export default function ErrorDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const getTimeFilter = () => {
    switch (timeRange) {
      case '24h': return subDays(new Date(), 1).toISOString();
      case '7d': return subDays(new Date(), 7).toISOString();
      case '30d': return subDays(new Date(), 30).toISOString();
      default: return null;
    }
  };

  // Fetch error summary by severity
  const { data: severitySummary, isLoading: loadingSummary, refetch: refetchSummary } = useQuery({
    queryKey: ['error-summary', timeRange],
    queryFn: async () => {
      const timeFilter = getTimeFilter();
      let query = supabase
        .from('error_logs')
        .select('severity, created_at')
        .order('created_at', { ascending: false });
      
      if (timeFilter) {
        query = query.gte('created_at', timeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by severity
      const summary: Record<ErrorSeverity, ErrorSummary> = {
        critical: { severity: 'critical', count: 0, first_seen: '', last_seen: '' },
        error: { severity: 'error', count: 0, first_seen: '', last_seen: '' },
        warning: { severity: 'warning', count: 0, first_seen: '', last_seen: '' },
      };

      data?.forEach((item) => {
        const sev = item.severity as ErrorSeverity;
        if (summary[sev]) {
          summary[sev].count++;
          if (!summary[sev].last_seen || item.created_at > summary[sev].last_seen) {
            summary[sev].last_seen = item.created_at;
          }
          if (!summary[sev].first_seen || item.created_at < summary[sev].first_seen) {
            summary[sev].first_seen = item.created_at;
          }
        }
      });

      return Object.values(summary);
    },
    staleTime: 60000,
  });

  // Fetch category breakdown
  const { data: categoryBreakdown } = useQuery({
    queryKey: ['error-categories', timeRange],
    queryFn: async () => {
      const timeFilter = getTimeFilter();
      let query = supabase
        .from('error_logs')
        .select('metadata');
      
      if (timeFilter) {
        query = query.gte('created_at', timeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Count by category
      const counts: Record<string, number> = {};
      data?.forEach((item) => {
        const category = (item.metadata as { category?: string })?.category || 'unknown';
        counts[category] = (counts[category] || 0) + 1;
      });

      return Object.entries(counts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count) as CategoryCount[];
    },
    staleTime: 60000,
  });

  // Fetch top errors
  const { data: topErrors } = useQuery({
    queryKey: ['top-errors', timeRange],
    queryFn: async () => {
      const timeFilter = getTimeFilter();
      let query = supabase
        .from('error_logs')
        .select('error_message, created_at');
      
      if (timeFilter) {
        query = query.gte('created_at', timeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by error message
      const grouped: Record<string, { count: number; lastSeen: string }> = {};
      data?.forEach((item) => {
        const msg = item.error_message?.substring(0, 200) || 'Unknown error';
        if (!grouped[msg]) {
          grouped[msg] = { count: 0, lastSeen: '' };
        }
        grouped[msg].count++;
        if (!grouped[msg].lastSeen || item.created_at > grouped[msg].lastSeen) {
          grouped[msg].lastSeen = item.created_at;
        }
      });

      return Object.entries(grouped)
        .map(([error_message, { count, lastSeen }]) => ({
          error_message,
          occurrences: count,
          last_seen: lastSeen,
        }))
        .sort((a, b) => b.occurrences - a.occurrences)
        .slice(0, 15) as TopError[];
    },
    staleTime: 60000,
  });

  // Fetch recent errors
  const { data: recentErrors, isLoading: loadingRecent, refetch: refetchRecent } = useQuery({
    queryKey: ['recent-errors', timeRange, categoryFilter, severityFilter],
    queryFn: async () => {
      const timeFilter = getTimeFilter();
      let query = supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (timeFilter) {
        query = query.gte('created_at', timeFilter);
      }

      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter by category in memory (since it's in JSONB)
      let filtered = data as ErrorLog[];
      if (categoryFilter !== 'all') {
        filtered = filtered.filter(
          (e) => e.metadata?.category === categoryFilter
        );
      }

      return filtered;
    },
    staleTime: 30000,
  });

  const totalErrors = severitySummary?.reduce((sum, s) => sum + s.count, 0) || 0;

  const handleRefresh = () => {
    refetchSummary();
    refetchRecent();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Error Dashboard</h1>
          <p className="text-muted-foreground">Monitor and analyze platform errors</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <SelectTrigger className="w-32">
              <Clock className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {loadingSummary ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalErrors.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                In selected time range
              </p>
            </CardContent>
          </Card>

          {(['critical', 'error', 'warning'] as ErrorSeverity[]).map((severity) => {
            const config = severityConfig[severity];
            const Icon = config.icon;
            const summary = severitySummary?.find((s) => s.severity === severity);
            
            return (
              <Card key={severity} className={summary && summary.count > 0 ? config.bgColor : ''}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium capitalize">{severity}</CardTitle>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${summary && summary.count > 0 ? config.color : 'text-foreground'}`}>
                    {summary?.count.toLocaleString() || 0}
                  </div>
                  {summary?.last_seen && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Last: {formatDistanceToNow(new Date(summary.last_seen), { addSuffix: true })}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="top-errors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="top-errors">Top Errors</TabsTrigger>
          <TabsTrigger value="by-category">By Category</TabsTrigger>
          <TabsTrigger value="recent">Recent Errors</TabsTrigger>
        </TabsList>

        {/* Top Errors Tab */}
        <TabsContent value="top-errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Frequent Errors</CardTitle>
              <CardDescription>Errors ranked by occurrence count</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {topErrors?.map((error, index) => (
                    <Collapsible key={index}>
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CollapsibleTrigger className="flex items-start justify-between w-full text-left gap-2">
                            <p className="text-sm font-medium text-foreground line-clamp-2">
                              {error.error_message}
                            </p>
                            <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                          </CollapsibleTrigger>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {error.occurrences.toLocaleString()} occurrences
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Last seen {formatDistanceToNow(new Date(error.last_seen), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <CollapsibleContent className="px-12 pb-2">
                        <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto whitespace-pre-wrap">
                          {error.error_message}
                        </pre>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Category Tab */}
        <TabsContent value="by-category" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Errors by Category</CardTitle>
              <CardDescription>Distribution across error categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryBreakdown?.map((cat) => {
                  const percentage = totalErrors > 0 ? (cat.count / totalErrors) * 100 : 0;
                  return (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize text-foreground">
                          {cat.category || 'Unknown'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {cat.count.toLocaleString()} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Errors Tab */}
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Errors</CardTitle>
                  <CardDescription>Latest errors with full details</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-28">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categoryBreakdown?.map((cat) => (
                        <SelectItem key={cat.category} value={cat.category || 'unknown'}>
                          {cat.category || 'Unknown'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingRecent ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {recentErrors?.map((error) => {
                      const config = severityConfig[error.severity] || severityConfig.error;
                      const Icon = config.icon;
                      
                      return (
                        <Collapsible key={error.id}>
                          <div className="p-3 rounded-lg border bg-card">
                            <CollapsibleTrigger className="w-full text-left">
                              <div className="flex items-start gap-3">
                                <div className={`flex-shrink-0 p-1.5 rounded ${config.bgColor}`}>
                                  <Icon className={`h-4 w-4 ${config.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {error.severity}
                                    </Badge>
                                    {error.metadata?.category && (
                                      <Badge variant="secondary" className="text-xs">
                                        {error.metadata.category}
                                      </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                      {format(new Date(error.created_at), 'MMM d, HH:mm:ss')}
                                    </span>
                                  </div>
                                  <p className="text-sm font-medium text-foreground mt-1 line-clamp-2">
                                    {error.error_message}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1 truncate">
                                    {error.url}
                                  </p>
                                </div>
                                <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-3 pt-3 border-t">
                              <div className="space-y-2 text-xs">
                                <div>
                                  <span className="font-medium text-foreground">Error Type:</span>{' '}
                                  <span className="text-muted-foreground">{error.error_type}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-foreground">URL:</span>{' '}
                                  <a 
                                    href={error.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline inline-flex items-center gap-1"
                                  >
                                    {error.url}
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </div>
                                {error.user_id && (
                                  <div>
                                    <span className="font-medium text-foreground">User ID:</span>{' '}
                                    <span className="text-muted-foreground font-mono">{error.user_id}</span>
                                  </div>
                                )}
                                {error.error_stack && (
                                  <div>
                                    <span className="font-medium text-foreground">Stack Trace:</span>
                                    <pre className="mt-1 bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap text-muted-foreground">
                                      {error.error_stack}
                                    </pre>
                                  </div>
                                )}
                                {error.metadata && Object.keys(error.metadata).length > 0 && (
                                  <div>
                                    <span className="font-medium text-foreground">Metadata:</span>
                                    <pre className="mt-1 bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap text-muted-foreground">
                                      {JSON.stringify(error.metadata, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      );
                    })}
                    {recentErrors?.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No errors found matching your filters
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
