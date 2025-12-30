import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Calendar,
  Users,
  TrendingUp,
  RefreshCw,
  Clock,
  MapPin,
  Video,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isFuture, isPast, isThisMonth, parseISO } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type Event = Database['public']['Tables']['events']['Row'];
type EventFormat = Database['public']['Enums']['event_format'];

interface EventWithDetails extends Event {
  organizer: {
    id: string;
    full_name: string | null;
    username: string | null;
  } | null;
  attendee_count: number;
}

interface MonthlyData {
  month: string;
  events: number;
  registrations: number;
}

interface OrganizerStats {
  organizer_id: string;
  organizer_name: string;
  event_count: number;
  total_registrations: number;
}

// Chart colors
const CHART_COLORS = [
  '#006B5A', // Emerald (in-person)
  '#3B82F6', // Blue (virtual)
  '#8B5CF6', // Purple (hybrid)
];

const FORMAT_COLORS: Record<EventFormat, string> = {
  in_person: '#10B981',
  virtual: '#3B82F6',
  hybrid: '#8B5CF6',
};

export default function EventAnalytics() {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all events with organizer info
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          organizer:profiles!events_organizer_id_fkey (
            id,
            full_name,
            username
          )
        `)
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      // Get attendee counts for each event
      const eventIds = eventsData?.map(e => e.id) || [];
      const { data: attendeeCounts, error: countError } = await supabase
        .from('event_attendees')
        .select('event_id, status')
        .in('event_id', eventIds);

      if (countError) throw countError;

      // Count attendees per event (going status)
      const countMap: Record<string, number> = {};
      attendeeCounts?.forEach(a => {
        if (a.status === 'going') {
          countMap[a.event_id] = (countMap[a.event_id] || 0) + 1;
        }
      });

      const eventsWithDetails: EventWithDetails[] = (eventsData || []).map(event => ({
        ...event,
        organizer: event.organizer as EventWithDetails['organizer'],
        attendee_count: countMap[event.id] || 0,
      }));

      setEvents(eventsWithDetails);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  // Calculate summary stats
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonthEvents = events.filter(e => isThisMonth(new Date(e.created_at)));
    const totalRegistrations = events.reduce((sum, e) => sum + e.attendee_count, 0);
    const thisMonthRegistrations = thisMonthEvents.reduce((sum, e) => sum + e.attendee_count, 0);

    // Calculate average attendance rate (registrations / max_attendees where max is set)
    const eventsWithMax = events.filter(e => e.max_attendees && e.max_attendees > 0);
    const avgAttendanceRate = eventsWithMax.length > 0
      ? Math.round(
          (eventsWithMax.reduce((sum, e) => sum + (e.attendee_count / (e.max_attendees || 1)), 0) /
            eventsWithMax.length) * 100
        )
      : 0;

    return {
      totalEvents: events.length,
      eventsThisMonth: thisMonthEvents.length,
      totalRegistrations,
      registrationsThisMonth: thisMonthRegistrations,
      avgAttendanceRate,
      upcomingEvents: events.filter(e => !e.is_cancelled && isFuture(new Date(e.start_time))).length,
    };
  }, [events]);

  // Calculate monthly trends (last 12 months)
  const monthlyData = useMemo(() => {
    const months: MonthlyData[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      const monthLabel = format(monthDate, 'MMM yyyy');

      const monthEvents = events.filter(e => {
        const createdAt = new Date(e.created_at);
        return createdAt >= monthStart && createdAt <= monthEnd;
      });

      const monthRegistrations = monthEvents.reduce((sum, e) => sum + e.attendee_count, 0);

      months.push({
        month: format(monthDate, 'MMM'),
        events: monthEvents.length,
        registrations: monthRegistrations,
      });
    }

    return months;
  }, [events]);

  // Events by format (pie chart)
  const formatData = useMemo(() => {
    const counts: Record<EventFormat, number> = {
      in_person: 0,
      virtual: 0,
      hybrid: 0,
    };

    events.forEach(e => {
      counts[e.format]++;
    });

    return Object.entries(counts)
      .map(([format, count]) => ({
        name: format.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
        value: count,
        color: FORMAT_COLORS[format as EventFormat],
      }))
      .filter(d => d.value > 0);
  }, [events]);

  // Top organizers (by event count)
  const topOrganizers = useMemo(() => {
    const organizerMap = new Map<string, OrganizerStats>();

    events.forEach(event => {
      if (!event.organizer) return;

      const key = event.organizer.id;
      const existing = organizerMap.get(key);

      if (existing) {
        existing.event_count++;
        existing.total_registrations += event.attendee_count;
      } else {
        organizerMap.set(key, {
          organizer_id: event.organizer.id,
          organizer_name: event.organizer.full_name || event.organizer.username || 'Unknown',
          event_count: 1,
          total_registrations: event.attendee_count,
        });
      }
    });

    return Array.from(organizerMap.values())
      .sort((a, b) => b.event_count - a.event_count)
      .slice(0, 10);
  }, [events]);

  // Recent events table
  const recentEvents = useMemo(() => {
    return events.slice(0, 10);
  }, [events]);

  const getStatusBadge = (event: EventWithDetails) => {
    if (event.is_cancelled) {
      return <Badge variant="destructive">Cancelled</Badge>;
    }
    if (isFuture(new Date(event.start_time))) {
      return <Badge className="bg-blue-500 hover:bg-blue-600">Upcoming</Badge>;
    }
    return <Badge variant="secondary">Past</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Event Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Monitor event performance and trends
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            <Clock className="w-4 h-4 inline mr-1" />
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold mt-1">{stats.totalEvents.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Events This Month</p>
                <p className="text-2xl font-bold mt-1">{stats.eventsThisMonth.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{format(new Date(), 'MMMM yyyy')}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Registrations</p>
                <p className="text-2xl font-bold mt-1">{stats.totalRegistrations.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Registrations This Month</p>
                <p className="text-2xl font-bold mt-1">{stats.registrationsThisMonth.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{format(new Date(), 'MMMM yyyy')}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Attendance Rate</p>
                <p className="text-2xl font-bold mt-1">{stats.avgAttendanceRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.upcomingEvents} upcoming
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Events Created Over Time</CardTitle>
            <CardDescription>Monthly event creation trend (last 12 months)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  tickLine={{ stroke: '#E2E8F0' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  tickLine={{ stroke: '#E2E8F0' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="events"
                  name="Events Created"
                  stroke="#006B5A"
                  strokeWidth={2}
                  dot={{ fill: '#006B5A', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Registrations Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Registrations Over Time</CardTitle>
            <CardDescription>Monthly registration trend (last 12 months)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  tickLine={{ stroke: '#E2E8F0' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  tickLine={{ stroke: '#E2E8F0' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="registrations"
                  name="Registrations"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events by Format */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Events by Format</CardTitle>
            <CardDescription>Distribution of event formats</CardDescription>
          </CardHeader>
          <CardContent>
            {formatData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={formatData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#94A3B8', strokeWidth: 1 }}
                  >
                    {formatData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [value.toLocaleString(), name]}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value: string) => (
                      <span className="text-sm text-slate-600">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No event data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Organizers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Organizers</CardTitle>
            <CardDescription>Most active event organizers</CardDescription>
          </CardHeader>
          <CardContent>
            {topOrganizers.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topOrganizers} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis
                    type="category"
                    dataKey="organizer_name"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    width={100}
                    tickFormatter={(value) =>
                      value.length > 15 ? `${value.slice(0, 15)}...` : value
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'event_count') return [value, 'Events'];
                      return [value, name];
                    }}
                  />
                  <Bar
                    dataKey="event_count"
                    name="Events"
                    fill="#006B5A"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No organizer data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Events Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Events</CardTitle>
          <CardDescription>Latest events with quick stats</CardDescription>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No events found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Event</TableHead>
                    <TableHead>Organizer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registrations</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium truncate max-w-[200px]">
                            {event.title}
                          </span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {event.event_type.replace('_', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm truncate max-w-[120px]">
                          {event.organizer?.full_name || event.organizer?.username || 'Unknown'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {format(new Date(event.start_time), 'MMM d, yyyy')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(event.start_time), 'h:mm a')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {event.format === 'virtual' ? (
                            <Video className="h-4 w-4 text-blue-500" />
                          ) : event.format === 'in_person' ? (
                            <MapPin className="h-4 w-4 text-green-500" />
                          ) : (
                            <>
                              <MapPin className="h-4 w-4 text-green-500" />
                              <Video className="h-4 w-4 text-blue-500" />
                            </>
                          )}
                          <span className="text-sm capitalize">
                            {event.format.replace('_', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(event)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{event.attendee_count}</span>
                          {event.max_attendees && (
                            <span className="text-muted-foreground">/ {event.max_attendees}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          to={`/dna/convene/events/${event.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
