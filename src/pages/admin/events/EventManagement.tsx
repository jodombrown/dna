import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Search,
  Download,
  Calendar,
  Users,
  MapPin,
  Video,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Clock
} from 'lucide-react';
import { format, formatDistanceToNow, isFuture, isPast } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type Event = Database['public']['Tables']['events']['Row'];
type EventFormat = Database['public']['Enums']['event_format'];
type EventType = Database['public']['Enums']['event_type'];

interface EventWithDetails extends Event {
  organizer: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
  attendee_count: number;
}

type StatusFilter = 'all' | 'upcoming' | 'past' | 'cancelled';
type SortField = 'start_time' | 'created_at' | 'attendee_count' | 'title';
type SortOrder = 'asc' | 'desc';

const ITEMS_PER_PAGE = 25;

export default function EventManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [organizerSearch, setOrganizerSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('start_time');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchEvents();
  }, [currentPage]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // First get all events with organizer info
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          organizer:profiles!events_organizer_id_fkey (
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      // Get attendee counts for each event
      const eventIds = eventsData?.map(e => e.id) || [];
      const { data: attendeeCounts, error: countError } = await supabase
        .from('event_attendees')
        .select('event_id')
        .in('event_id', eventIds)
        .eq('status', 'going');

      if (countError) throw countError;

      // Count attendees per event
      const countMap: Record<string, number> = {};
      attendeeCounts?.forEach(a => {
        countMap[a.event_id] = (countMap[a.event_id] || 0) + 1;
      });

      // Combine data
      const eventsWithDetails: EventWithDetails[] = (eventsData || []).map(event => ({
        ...event,
        organizer: event.organizer as EventWithDetails['organizer'],
        attendee_count: countMap[event.id] || 0,
      }));

      setEvents(eventsWithDetails);
      setTotalCount(eventsWithDetails.length);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    // Status filter
    if (statusFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(event => {
        if (statusFilter === 'cancelled') return event.is_cancelled;
        if (statusFilter === 'upcoming') return !event.is_cancelled && isFuture(new Date(event.start_time));
        if (statusFilter === 'past') return !event.is_cancelled && isPast(new Date(event.end_time));
        return true;
      });
    }

    // Search by event name
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query)
      );
    }

    // Search by organizer
    if (organizerSearch) {
      const query = organizerSearch.toLowerCase();
      filtered = filtered.filter(event =>
        event.organizer?.full_name?.toLowerCase().includes(query) ||
        event.organizer?.username?.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'start_time':
          comparison = new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'attendee_count':
          comparison = a.attendee_count - b.attendee_count;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [events, statusFilter, searchQuery, organizerSearch, sortField, sortOrder]);

  // Paginate
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEvents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEvents, currentPage]);

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleDownloadCSV = () => {
    const csvHeaders = ['Event Name', 'Organizer', 'Date', 'Format', 'Type', 'Status', 'Registrations', 'Location'];
    const csvData = filteredEvents.map(event => [
      event.title,
      event.organizer?.full_name || event.organizer?.username || 'Unknown',
      format(new Date(event.start_time), 'yyyy-MM-dd HH:mm'),
      event.format,
      event.event_type,
      getEventStatus(event),
      event.attendee_count.toString(),
      event.format === 'virtual' ? 'Virtual' : event.location_city || 'N/A',
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `events-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getEventStatus = (event: EventWithDetails): string => {
    if (event.is_cancelled) return 'Cancelled';
    const now = new Date();
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);
    if (isPast(endTime)) return 'Past';
    if (isFuture(startTime)) return 'Upcoming';
    return 'In Progress';
  };

  const getStatusBadge = (event: EventWithDetails) => {
    const status = getEventStatus(event);
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
      'Upcoming': { variant: 'default', className: 'bg-blue-500 hover:bg-blue-600' },
      'Past': { variant: 'secondary' },
      'In Progress': { variant: 'default', className: 'bg-green-500 hover:bg-green-600' },
      'Cancelled': { variant: 'destructive' },
    };

    const config = variants[status] || variants['Past'];
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const getFormatIcon = (format: EventFormat) => {
    switch (format) {
      case 'virtual':
        return <Video className="h-4 w-4 text-blue-500" />;
      case 'in_person':
        return <MapPin className="h-4 w-4 text-green-500" />;
      case 'hybrid':
        return (
          <div className="flex gap-1">
            <MapPin className="h-4 w-4 text-green-500" />
            <Video className="h-4 w-4 text-blue-500" />
          </div>
        );
    }
  };

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: events.length,
      upcoming: events.filter(e => !e.is_cancelled && isFuture(new Date(e.start_time))).length,
      past: events.filter(e => !e.is_cancelled && isPast(new Date(e.end_time))).length,
      cancelled: events.filter(e => e.is_cancelled).length,
      totalRegistrations: events.reduce((sum, e) => sum + e.attendee_count, 0),
    };
  }, [events]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Event Management</h1>
        <p className="text-muted-foreground">
          View and manage all platform events
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Events</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.upcoming}</p>
              <p className="text-sm text-muted-foreground mt-1">Upcoming</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-600">{stats.past}</p>
              <p className="text-sm text-muted-foreground mt-1">Past</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{stats.cancelled}</p>
              <p className="text-sm text-muted-foreground mt-1">Cancelled</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-600">{stats.totalRegistrations}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Registrations</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search by event name */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by event name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Search by organizer */}
            <div className="w-full lg:w-[200px] relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Organizer..."
                value={organizerSearch}
                onChange={(e) => {
                  setOrganizerSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value: StatusFilter) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Download CSV */}
            <Button variant="outline" onClick={handleDownloadCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Events ({filteredEvents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No events found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[250px]">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-3 h-8"
                          onClick={() => handleSort('title')}
                        >
                          Event Name
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Organizer</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-3 h-8"
                          onClick={() => handleSort('start_time')}
                        >
                          Date
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-3 h-8"
                          onClick={() => handleSort('attendee_count')}
                        >
                          Registrations
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEvents.map((event) => (
                      <TableRow key={event.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium truncate max-w-[250px]">
                              {event.title}
                            </span>
                            <span className="text-xs text-muted-foreground capitalize">
                              {event.event_type.replace('_', ' ')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {event.organizer?.avatar_url && (
                              <img
                                src={event.organizer.avatar_url}
                                alt=""
                                className="h-6 w-6 rounded-full"
                              />
                            )}
                            <span className="text-sm truncate max-w-[150px]">
                              {event.organizer?.full_name || event.organizer?.username || 'Unknown'}
                            </span>
                          </div>
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
                            {getFormatIcon(event.format)}
                            <span className="text-sm capitalize">
                              {event.format.replace('_', ' ')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(event)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{event.attendee_count}</span>
                            {event.max_attendees && (
                              <span className="text-muted-foreground">
                                / {event.max_attendees}
                              </span>
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
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredEvents.length)} of{' '}
                    {filteredEvents.length} events
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="text-sm px-4">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
