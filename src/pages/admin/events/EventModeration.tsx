import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Flag,
  ExternalLink,
  MessageSquare,
  Trash2,
  XCircle,
  AlertTriangle,
  MoreHorizontal,
  Clock,
  CheckCircle,
  Eye
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface EventReport {
  id: string;
  event_id: string;
  reported_by: string;
  reason: string;
  description: string | null;
  status: string;
  created_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  event?: {
    id: string;
    title: string;
    organizer_id: string;
    is_cancelled: boolean;
    organizer?: {
      id: string;
      full_name: string | null;
      username: string | null;
    } | null;
  } | null;
  reporter?: {
    id: string;
    full_name: string | null;
    username: string | null;
  } | null;
}

type StatusFilter = 'all' | 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export default function EventModeration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [reports, setReports] = useState<EventReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set());
  const [selectedReport, setSelectedReport] = useState<EventReport | null>(null);
  const [processing, setProcessing] = useState(false);

  // Dialog states
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showWarnDialog, setShowWarnDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Fetch event reports with event and reporter info
      // Note: event_reports may reference events_old, so we handle this gracefully
      const { data: reportsData, error } = await supabase
        .from('event_reports')
        .select(`
          *,
          reporter:profiles!event_reports_reported_by_fkey (
            id,
            full_name,
            username
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch event details separately to handle FK differences
      const eventIds = [...new Set((reportsData || []).map(r => r.event_id))];

      const { data: eventsData } = await supabase
        .from('events')
        .select(`
          id,
          title,
          organizer_id,
          is_cancelled,
          organizer:profiles!events_organizer_id_fkey (
            id,
            full_name,
            username
          )
        `)
        .in('id', eventIds);

      const eventMap = new Map(eventsData?.map(e => [e.id, e]) || []);

      const reportsWithDetails: EventReport[] = (reportsData || []).map(report => ({
        ...report,
        reporter: report.reporter as EventReport['reporter'],
        event: eventMap.get(report.event_id) as EventReport['event'] || null,
      }));

      setReports(reportsWithDetails);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to load event reports',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const logAdminAction = async (action: string, entityId: string, details: Record<string, unknown>) => {
    try {
      await supabase.from('admin_activity_log').insert({
        admin_id: user!.id,
        action,
        entity_type: 'event_report',
        entity_id: entityId,
        details,
      });
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  };

  const filteredReports = useMemo(() => {
    if (statusFilter === 'all') return reports;
    return reports.filter(r => r.status === statusFilter);
  }, [reports, statusFilter]);

  const handleDismissReport = async (reportId: string) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('event_reports')
        .update({
          status: 'dismissed',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user!.id,
        })
        .eq('id', reportId);

      if (error) throw error;

      await logAdminAction('dismiss_event_report', reportId, {
        notes: adminNotes || null,
      });

      toast({
        title: 'Success',
        description: 'Report dismissed',
      });

      fetchReports();
      setShowReviewDialog(false);
      setAdminNotes('');
      setSelectedReport(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to dismiss report',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveEvent = async () => {
    if (!selectedReport?.event) return;
    setProcessing(true);
    try {
      // Soft delete the event by marking it as cancelled
      const { error: eventError } = await supabase
        .from('events')
        .update({
          is_cancelled: true,
          cancellation_reason: adminNotes || 'Removed by admin due to policy violation',
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedReport.event.id);

      if (eventError) throw eventError;

      // Update the report status
      const { error: reportError } = await supabase
        .from('event_reports')
        .update({
          status: 'resolved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user!.id,
        })
        .eq('id', selectedReport.id);

      if (reportError) throw reportError;

      await logAdminAction('remove_event', selectedReport.event.id, {
        report_id: selectedReport.id,
        reason: adminNotes || 'Policy violation',
      });

      toast({
        title: 'Success',
        description: 'Event removed successfully',
      });

      fetchReports();
      setShowRemoveDialog(false);
      setAdminNotes('');
      setSelectedReport(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove event',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleWarnOrganizer = async () => {
    if (!selectedReport?.event?.organizer_id) return;
    setProcessing(true);
    try {
      // Create a notification for the organizer
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: selectedReport.event.organizer_id,
          type: 'admin_warning',
          title: 'Warning from DNA Admin',
          message: warningMessage || 'Your event has been flagged for potential policy violations. Please review our community guidelines.',
          is_read: false,
          metadata: {
            event_id: selectedReport.event.id,
            report_id: selectedReport.id,
          },
        });

      if (notifError) throw notifError;

      // Update report status
      const { error: reportError } = await supabase
        .from('event_reports')
        .update({
          status: 'reviewed',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user!.id,
        })
        .eq('id', selectedReport.id);

      if (reportError) throw reportError;

      await logAdminAction('warn_organizer', selectedReport.event.organizer_id, {
        report_id: selectedReport.id,
        event_id: selectedReport.event.id,
        message: warningMessage,
      });

      toast({
        title: 'Success',
        description: 'Warning sent to organizer',
      });

      fetchReports();
      setShowWarnDialog(false);
      setWarningMessage('');
      setSelectedReport(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send warning',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleContactOrganizer = () => {
    if (!selectedReport?.event?.organizer_id) return;
    // Navigate to messages with the organizer
    navigate(`/dna/messages?compose=${selectedReport.event.organizer_id}`);
    setShowContactDialog(false);
    setSelectedReport(null);
  };

  const handleBulkDismiss = async () => {
    if (selectedReports.size === 0) return;
    setProcessing(true);
    try {
      const updates = Array.from(selectedReports).map(id =>
        supabase
          .from('event_reports')
          .update({
            status: 'dismissed',
            reviewed_at: new Date().toISOString(),
            reviewed_by: user!.id,
          })
          .eq('id', id)
      );

      await Promise.all(updates);

      await logAdminAction('bulk_dismiss_event_reports', 'multiple', {
        count: selectedReports.size,
        report_ids: Array.from(selectedReports),
      });

      toast({
        title: 'Success',
        description: `${selectedReports.size} reports dismissed`,
      });

      setSelectedReports(new Set());
      fetchReports();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to dismiss reports',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedReports);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedReports(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedReports.size === filteredReports.length) {
      setSelectedReports(new Set());
    } else {
      setSelectedReports(new Set(filteredReports.map(r => r.id)));
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock; label: string }> = {
      pending: { variant: 'secondary', icon: Clock, label: 'Pending' },
      reviewed: { variant: 'default', icon: Eye, label: 'Reviewed' },
      resolved: { variant: 'default', icon: CheckCircle, label: 'Resolved' },
      dismissed: { variant: 'outline', icon: XCircle, label: 'Dismissed' },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getReasonBadge = (reason: string) => {
    const colors: Record<string, string> = {
      spam: 'bg-orange-100 text-orange-700',
      inappropriate: 'bg-red-100 text-red-700',
      misleading: 'bg-yellow-100 text-yellow-700',
      harassment: 'bg-purple-100 text-purple-700',
      other: 'bg-slate-100 text-slate-700',
    };

    return (
      <Badge className={colors[reason.toLowerCase()] || colors.other} variant="outline">
        {reason}
      </Badge>
    );
  };

  const stats = useMemo(() => ({
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    reviewed: reports.filter(r => r.status === 'reviewed').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    dismissed: reports.filter(r => r.status === 'dismissed').length,
  }), [reports]);

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
        <h1 className="text-3xl font-bold mb-2">Event Moderation</h1>
        <p className="text-muted-foreground">
          Review and moderate reported events
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Reports</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
              <p className="text-sm text-muted-foreground mt-1">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.reviewed}</p>
              <p className="text-sm text-muted-foreground mt-1">Reviewed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
              <p className="text-sm text-muted-foreground mt-1">Resolved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-600">{stats.dismissed}</p>
              <p className="text-sm text-muted-foreground mt-1">Dismissed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Bulk Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value: StatusFilter) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>

            {/* Bulk Actions */}
            {selectedReports.size > 0 && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg flex-1">
                <p className="text-sm font-medium">
                  {selectedReports.size} selected
                </p>
                <div className="flex gap-2 ml-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkDismiss}
                    disabled={processing}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Dismiss Selected
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-orange-500" />
            Event Reports ({filteredReports.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Flag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reports found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={selectedReports.size === filteredReports.length && filteredReports.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="min-w-[200px]">Event</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Reported</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedReports.has(report.id)}
                          onCheckedChange={() => toggleSelection(report.id)}
                        />
                      </TableCell>
                      <TableCell>
                        {report.event ? (
                          <div className="flex flex-col">
                            <span className="font-medium truncate max-w-[200px]">
                              {report.event.title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              by {report.event.organizer?.full_name || report.event.organizer?.username || 'Unknown'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Event not found</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {report.reporter?.full_name || report.reporter?.username || 'Anonymous'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getReasonBadge(report.reason)}
                          {report.description && (
                            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {report.description}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {report.created_at
                            ? formatDistanceToNow(new Date(report.created_at), { addSuffix: true })
                            : 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(report.status)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {report.event && (
                              <DropdownMenuItem asChild>
                                <Link
                                  to={`/dna/convene/events/${report.event.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View Event
                                </Link>
                              </DropdownMenuItem>
                            )}
                            {report.event?.organizer_id && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedReport(report);
                                  setShowContactDialog(true);
                                }}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Contact Organizer
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedReport(report);
                                setShowReviewDialog(true);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Dismiss Report
                            </DropdownMenuItem>
                            {report.event?.organizer_id && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedReport(report);
                                  setWarningMessage(
                                    'Your event has been flagged for potential policy violations. Please review our community guidelines and ensure your event complies with our terms of service.'
                                  );
                                  setShowWarnDialog(true);
                                }}
                              >
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Warn Organizer
                              </DropdownMenuItem>
                            )}
                            {report.event && !report.event.is_cancelled && (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedReport(report);
                                  setShowRemoveDialog(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Event
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dismiss Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dismiss Report</DialogTitle>
            <DialogDescription>
              This will mark the report as dismissed with no action taken.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Admin Notes (optional)</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes about why this report was dismissed..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedReport && handleDismissReport(selectedReport.id)}
              disabled={processing}
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Dismiss Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Event Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Remove Event
            </DialogTitle>
            <DialogDescription>
              This will cancel the event and notify attendees. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedReport?.event && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedReport.event.title}</p>
                <p className="text-sm text-muted-foreground">
                  Organizer: {selectedReport.event.organizer?.full_name || selectedReport.event.organizer?.username}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Reason for Removal</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Explain why this event is being removed..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveEvent}
              disabled={processing}
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Remove Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Warn Organizer Dialog */}
      <Dialog open={showWarnDialog} onOpenChange={setShowWarnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Warn Organizer
            </DialogTitle>
            <DialogDescription>
              Send a warning message to the event organizer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Warning Message</label>
              <Textarea
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
                placeholder="Enter the warning message..."
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWarnDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleWarnOrganizer}
              disabled={processing || !warningMessage.trim()}
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <AlertTriangle className="h-4 w-4 mr-2" />
              )}
              Send Warning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Organizer Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Organizer</DialogTitle>
            <DialogDescription>
              Open a direct message conversation with the event organizer.
            </DialogDescription>
          </DialogHeader>
          {selectedReport?.event?.organizer && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium">
                {selectedReport.event.organizer.full_name || selectedReport.event.organizer.username}
              </p>
              <p className="text-sm text-muted-foreground">
                Event: {selectedReport.event.title}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContactDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleContactOrganizer}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Open Messages
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
