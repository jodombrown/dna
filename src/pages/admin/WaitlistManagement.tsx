import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Search,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  User,
  Calendar,
  Send,
  MoreHorizontal,
  Archive,
  ArchiveRestore,
  RotateCcw,
  Copy,
  Trash2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  settleBulkAction,
  describeSettlement,
  describeProgress,
  needsInvite,
  reasonOf,
  NEEDS_INVITE_FILTER,
  type WaitlistRowRef,
} from '@/lib/waitlistSettlement';

interface WaitlistEntry {
  id: string;
  email: string;
  full_name: string | null;
  message: string | null;
  linkedin_url: string | null;
  country: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  last_invite_sent_at: string | null;
  last_invite_sent_by: string | null;
  archived_at: string | null;
}

export default function WaitlistManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  // Label for an in-flight bulk batch. Capped concurrency means a large batch
  // takes a minute or two, and a disabled button with no feedback reads as a
  // hang. Null when nothing is running.
  const [bulkProgress, setBulkProgress] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ ids: string[]; label: string } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    fetchWaitlist();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [entries, searchQuery, statusFilter]);

  const fetchWaitlist = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('beta_waitlist')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load waitlist entries',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = [...entries];

    // Archived entries live in their own view, never in the working list
    if (statusFilter === 'archived') {
      filtered = filtered.filter(e => e.archived_at);
    } else if (statusFilter === NEEDS_INVITE_FILTER) {
      // Not a beta_waitlist.status. This is the stranded-row invariant:
      // approved, never emailed, not archived. See needsInvite.
      filtered = filtered.filter(needsInvite);
    } else {
      filtered = filtered.filter(e => !e.archived_at);
      if (statusFilter !== 'all') {
        filtered = filtered.filter(e => e.status === statusFilter);
      }
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        e =>
          e.email.toLowerCase().includes(query) ||
          e.full_name?.toLowerCase().includes(query)
      );
    }

    setFilteredEntries(filtered);
  };

  const logAdminAction = async (action: string, entityId: string, details: any) => {
    try {
      await supabase.from('admin_activity_log').insert({
        admin_id: user!.id,
        action,
        entity_type: 'waitlist',
        entity_id: entityId,
        details,
      });
    } catch (error) {
      // Error logging admin action
    }
  };

  /**
   * Pull the real cause out of a functions.invoke failure.
   *
   * supabase-js reports any non-2xx as a FunctionsHttpError whose message is
   * the generic "Edge Function returned a non-2xx status code". The body that
   * says WHY hangs off err.context, so a summary built from err.message alone
   * would name the failing addresses and tell the admin nothing about them.
   */
  const invokeReason = async (err: unknown): Promise<string> => {
    const context = (err as { context?: unknown } | null)?.context;
    if (context && typeof (context as Response).clone === 'function') {
      try {
        const body = await (context as Response).clone().json();
        const detail = body?.error ?? body?.message;
        if (typeof detail === 'string' && detail.trim()) return detail.trim();
      } catch {
        // Body was not JSON, or was already read. Fall back to the message.
      }
    }
    return reasonOf(err);
  };

  /**
   * Flip one row's status, throwing when it did not actually change.
   *
   * postgrest resolves with { data, error } rather than rejecting, so an
   * allSettled over these would report "fulfilled" for a failed write. The
   * explicit throw is what makes the settlement readable. .select() is what
   * catches the silent case: no error, no matching row, nothing updated.
   */
  const updateRowStatus = async (row: WaitlistRowRef, status: string): Promise<void> => {
    const { data, error } = await supabase
      .from('beta_waitlist')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', row.id)
      .select('id')
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('No matching row was updated');
  };

  /**
   * Send one row's access email, throwing with the real cause on failure.
   *
   * send-beta-access-granted returns 409 unless the row already reads
   * 'approved', so this can only run after the flip has landed. It stamps
   * last_invite_sent_at itself, and only once Resend has confirmed, which is
   * what makes the "Needs invite" invariant trustworthy.
   */
  const sendRowInvite = async (row: WaitlistRowRef): Promise<void> => {
    const { error } = await supabase.functions.invoke('send-beta-access-granted', {
      body: { waitlistId: row.id },
    });
    if (error) throw new Error(await invokeReason(error));
  };

  /** Pair selected ids with their addresses so failures can be named. */
  const rowsFor = (ids: string[]): WaitlistRowRef[] =>
    ids.map(id => ({ id, email: entries.find(e => e.id === id)?.email ?? id }));

  const handleStatusUpdate = async (entryId: string, newStatus: string) => {
    setProcessing(true);
    try {
      const [row] = rowsFor([entryId]);
      const previousStatus = entries.find(e => e.id === entryId)?.status;

      await updateRowStatus(row, newStatus);

      // From here the flip HAS landed. A failure past this point is an email
      // failure, not a status failure, and must not be reported as one.
      let inviteError: string | null = null;
      if (newStatus === 'approved') {
        try {
          await sendRowInvite(row);
        } catch (err) {
          inviteError = reasonOf(err);
          console.error('Access email failed after approval', row.email, err);
        }
      }

      await logAdminAction(`waitlist_${newStatus}`, entryId, {
        previous_status: previousStatus,
        new_status: newStatus,
        notes: adminNotes || null,
        invite_error: inviteError,
      });

      if (inviteError) {
        toast({
          title: 'Approved, but the email did not send',
          description: `${row.email} is approved. The access email failed: ${inviteError}. The row is waiting under "Needs invite", where Resend invite will try again.`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: `Entry ${newStatus}`,
        });
      }

      // Refetch either way. The old code skipped this on an invite failure, so
      // the table went on showing the pre-flip status for a row that had in
      // fact already been approved.
      fetchWaitlist();
      setShowReviewDialog(false);
      setAdminNotes('');
    } catch (error) {
      console.error('Failed to update waitlist status', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedEntries.size === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select entries to perform bulk actions',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    try {
      const rows = rowsFor(Array.from(selectedEntries));

      // Both phases settle per row. The flip has to precede the send because
      // send-beta-access-granted answers 409 on anything not already approved,
      // which makes a partly-emailed batch structurally possible. Reporting it
      // per row is the whole point: see src/lib/waitlistSettlement.ts.
      const settlement = await settleBulkAction(rows, {
        updateStatus: row => updateRowStatus(row, action),
        sendInvite: action === 'approved' ? sendRowInvite : undefined,
        onProgress: progress => setBulkProgress(describeProgress(action, progress)),
      });

      await logAdminAction(`bulk_waitlist_${action}`, 'multiple', {
        count: rows.length,
        entry_ids: rows.map(r => r.id),
        status_ok: settlement.statusOk.length,
        status_failed: settlement.statusFailed.map(r => ({ email: r.email, reason: r.reason })),
        invites_sent: settlement.inviteOk.length,
        invites_failed: settlement.inviteFailed.map(r => ({ email: r.email, reason: r.reason })),
      });

      const summary = describeSettlement(action, settlement);
      toast({
        title: summary.title,
        description: summary.description,
        variant: summary.destructive ? 'destructive' : 'default',
      });

      // Rows that did not fully settle stay selected, so a retry is one click.
      // A row carries a reason only when something about it is unfinished.
      setSelectedEntries(new Set(settlement.rows.filter(r => r.reason).map(r => r.id)));
      fetchWaitlist();
    } catch (error) {
      console.error('Bulk action failed', error);
      toast({
        title: 'Error',
        description: 'Failed to perform bulk action',
        variant: 'destructive',
      });
    } finally {
      setBulkProgress(null);
      setProcessing(false);
    }
  };

  const handleSendAccessEmail = async (entry: WaitlistEntry) => {
    setProcessing(true);
    try {
      // Safe to call repeatedly: send-beta-access-granted falls back from
      // invite to magiclink when the auth user already exists, so a resend
      // does not die on "user already registered".
      await sendRowInvite({ id: entry.id, email: entry.email });

      toast({
        title: 'Access email sent',
        description: `${entry.email} can now set a password and sign in.`,
      });

      fetchWaitlist();
    } catch (error) {
      console.error('Failed to send access email', error);
      toast({
        title: 'Error',
        description: `Could not email ${entry.email}: ${reasonOf(error)}`,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleArchiveToggle = async (ids: string[], archive: boolean) => {
    setProcessing(true);
    try {
      const { data, error } = await supabase
        .from('beta_waitlist')
        .update({
          archived_at: archive ? new Date().toISOString() : null,
          archived_by: archive ? user!.id : null,
          updated_at: new Date().toISOString(),
        })
        .in('id', ids)
        .select('id, archived_at');

      if (error) throw error;

      await logAdminAction(archive ? 'waitlist_archived' : 'waitlist_unarchived', ids.length === 1 ? ids[0] : 'multiple', {
        entry_ids: ids,
        count: ids.length,
      });

      toast({
        title: archive ? 'Archived' : 'Restored',
        description: `${data?.length ?? 0} ${(data?.length ?? 0) === 1 ? 'entry' : 'entries'} ${archive ? 'archived' : 'restored'}`,
      });

      setSelectedEntries(new Set());
      setShowReviewDialog(false);
      fetchWaitlist();
    } catch (error) {
      console.error('Failed to archive waitlist entries', error);
      toast({
        title: 'Error',
        description: archive ? 'Failed to archive' : 'Failed to restore',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleResetToPending = async (entryId: string) => {
    setProcessing(true);
    try {
      const previous = entries.find(e => e.id === entryId)?.status;
      const { data, error } = await supabase
        .from('beta_waitlist')
        .update({ status: 'pending', updated_at: new Date().toISOString() })
        .eq('id', entryId)
        .select('id, status')
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Entry not found');

      await logAdminAction('waitlist_reset_pending', entryId, {
        previous_status: previous ?? null,
        new_status: data.status,
      });

      toast({ title: 'Reset to pending', description: 'No email was sent.' });
      setShowReviewDialog(false);
      fetchWaitlist();
    } catch (error) {
      console.error('Failed to reset waitlist entry', error);
      toast({ title: 'Error', description: 'Failed to reset the entry', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      toast({ title: 'Email copied', description: email });
    } catch (error) {
      console.error('Clipboard write failed', error);
      toast({ title: 'Could not copy', description: email, variant: 'destructive' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setProcessing(true);
    try {
      const { data, error } = await supabase
        .from('beta_waitlist')
        .delete()
        .in('id', deleteTarget.ids)
        .select('id, email');

      if (error) throw error;

      await logAdminAction('waitlist_deleted', deleteTarget.ids.length === 1 ? deleteTarget.ids[0] : 'multiple', {
        entry_ids: deleteTarget.ids,
        emails: (data ?? []).map(row => row.email),
        count: data?.length ?? 0,
      });

      toast({
        title: 'Deleted',
        description: `${data?.length ?? 0} ${(data?.length ?? 0) === 1 ? 'entry' : 'entries'} permanently deleted`,
      });

      setDeleteTarget(null);
      setDeleteConfirmText('');
      setSelectedEntries(new Set());
      setShowReviewDialog(false);
      fetchWaitlist();
    } catch (error) {
      console.error('Failed to delete waitlist entries', error);
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadCSV = () => {
    const csvHeaders = ['Name', 'Email', 'Country', 'LinkedIn', 'Message', 'Status', 'Joined Date', 'Access Email Sent', 'Archived'];
    const csvData = filteredEntries.map(entry => [
      entry.full_name || 'N/A',
      entry.email,
      entry.country || 'N/A',
      entry.linkedin_url || 'N/A',
      entry.message || 'N/A',
      entry.status,
      new Date(entry.created_at).toLocaleDateString(),
      entry.last_invite_sent_at ? new Date(entry.last_invite_sent_at).toLocaleDateString() : 'Not sent',
      entry.archived_at ? new Date(entry.archived_at).toLocaleDateString() : 'No',
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dna-waitlist-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedEntries);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedEntries(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedEntries.size === filteredEntries.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(filteredEntries.map(e => e.id)));
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      pending: { variant: 'secondary', icon: Clock, label: 'Pending' },
      approved: { variant: 'default', icon: CheckCircle, label: 'Approved' },
      rejected: { variant: 'destructive', icon: XCircle, label: 'Rejected' },
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

  const activeEntries = entries.filter(e => !e.archived_at);
  const stats = {
    total: activeEntries.length,
    pending: activeEntries.filter(e => e.status === 'pending').length,
    approved: activeEntries.filter(e => e.status === 'approved').length,
    rejected: activeEntries.filter(e => e.status === 'rejected').length,
    archived: entries.filter(e => e.archived_at).length,
    // Approved, never emailed, not archived. Reads 0 when nobody is stranded,
    // which is the invariant the founder QA checks after an approval.
    needsInvite: entries.filter(needsInvite).length,
  };

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
        <h1 className="text-3xl font-bold mb-2">Waitlist Management</h1>
        <p className="text-muted-foreground">
          Manage beta waitlist applications and send invitations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Applications</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
              <p className="text-sm text-muted-foreground mt-1">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              <p className="text-sm text-muted-foreground mt-1">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              <p className="text-sm text-muted-foreground mt-1">Rejected</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-muted-foreground">{stats.archived}</p>
              <p className="text-sm text-muted-foreground mt-1">Archived</p>
            </div>
          </CardContent>
        </Card>
        {/*
          Approved but never emailed. This is the counter that would have made
          a half-sent batch of 200 legible, so it sits with the others rather
          than behind the filter dropdown. Clicking it opens the same view.
        */}
        <Card>
          <CardContent className="pt-6">
            <button
              type="button"
              className="w-full text-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => setStatusFilter(NEEDS_INVITE_FILTER)}
              aria-label={`Needs invite: ${stats.needsInvite}. Show these entries.`}
            >
              <p
                className={
                  stats.needsInvite > 0
                    ? 'text-3xl font-bold text-destructive'
                    : 'text-3xl font-bold text-muted-foreground'
                }
              >
                {stats.needsInvite}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Needs invite</p>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value={NEEDS_INVITE_FILTER}>Needs invite</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            {/* Download CSV */}
            <Button variant="outline" onClick={handleDownloadCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Bulk Actions */}
          {selectedEntries.size > 0 && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium flex items-center gap-2" aria-live="polite">
                {bulkProgress ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {bulkProgress}
                  </>
                ) : (
                  `${selectedEntries.size} selected`
                )}
              </p>
              <div className="flex gap-2 ml-auto">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleBulkAction('approved')}
                  disabled={processing}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBulkAction('rejected')}
                  disabled={processing}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                {statusFilter === 'archived' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleArchiveToggle(Array.from(selectedEntries), false)}
                    disabled={processing}
                  >
                    <ArchiveRestore className="h-4 w-4 mr-1" />
                    Restore
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleArchiveToggle(Array.from(selectedEntries), true)}
                    disabled={processing}
                  >
                    <Archive className="h-4 w-4 mr-1" />
                    Archive
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setDeleteConfirmText('');
                    setDeleteTarget({
                      ids: Array.from(selectedEntries),
                      label: `${selectedEntries.size} ${selectedEntries.size === 1 ? 'entry' : 'entries'}`,
                    });
                  }}
                  disabled={processing}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Waitlist Table */}
      <Card>
        <CardHeader>
          <CardTitle>Waitlist Entries ({filteredEntries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {statusFilter === NEEDS_INVITE_FILTER
                ? 'Nobody is waiting on an invite. Every approved entry has been emailed.'
                : 'No entries found'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">
                      <Checkbox
                        checked={selectedEntries.size === filteredEntries.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="text-left p-3">Applicant</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Country</th>
                    <th className="text-left p-3">LinkedIn</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Applied</th>
                    <th className="text-left p-3">Access email</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <Checkbox
                          checked={selectedEntries.has(entry.id)}
                          onCheckedChange={() => toggleSelection(entry.id)}
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {entry.full_name || 'No name provided'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{entry.email}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm">{entry.country || '-'}</span>
                      </td>
                      <td className="p-3">
                        {entry.linkedin_url ? (
                          <a
                            href={entry.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            Profile
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col items-start gap-1">
                          {getStatusBadge(entry.status)}
                          {needsInvite(entry) && (
                            <Badge variant="destructive" className="gap-1">
                              <Send className="h-3 w-3" />
                              Needs invite
                            </Badge>
                          )}
                          {entry.archived_at && (
                            <Badge variant="outline" className="gap-1">
                              <Archive className="h-3 w-3" />
                              Archived {formatDistanceToNow(new Date(entry.archived_at), { addSuffix: true })}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-muted-foreground">
                          {entry.last_invite_sent_at
                            ? `Sent ${formatDistanceToNow(new Date(entry.last_invite_sent_at), { addSuffix: true })}`
                            : 'Not sent'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedEntry(entry);
                              setShowReviewDialog(true);
                            }}
                          >
                            Review
                          </Button>
                          {entry.status === 'approved' && !entry.archived_at && (
                            <Button
                              size="sm"
                              variant={needsInvite(entry) ? 'default' : 'secondary'}
                              disabled={processing}
                              onClick={() => handleSendAccessEmail(entry)}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              {entry.last_invite_sent_at ? 'Resend invite' : 'Send invite'}
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" aria-label="More actions">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {entry.archived_at ? (
                                <DropdownMenuItem onClick={() => handleArchiveToggle([entry.id], false)}>
                                  <ArchiveRestore className="h-4 w-4 mr-2" />
                                  Unarchive
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleArchiveToggle([entry.id], true)}>
                                  <Archive className="h-4 w-4 mr-2" />
                                  Archive
                                </DropdownMenuItem>
                              )}
                              {entry.status !== 'pending' && (
                                <DropdownMenuItem onClick={() => handleResetToPending(entry.id)}>
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Reset to pending
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleCopyEmail(entry.email)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  setDeleteConfirmText('');
                                  setDeleteTarget({
                                    ids: [entry.id],
                                    label: `${entry.full_name || 'this applicant'} (${entry.email})`,
                                  });
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete permanently
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
          </DialogHeader>

          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-foreground">{selectedEntry.full_name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-foreground">{selectedEntry.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Country</label>
                  <p className="text-foreground">{selectedEntry.country || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Access email</label>
                  <p className="text-foreground">
                    {selectedEntry.last_invite_sent_at
                      ? `Sent ${formatDistanceToNow(new Date(selectedEntry.last_invite_sent_at), { addSuffix: true })}`
                      : 'Not sent'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">LinkedIn</label>
                  {selectedEntry.linkedin_url ? (
                    <a
                      href={selectedEntry.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View Profile
                    </a>
                  ) : (
                    <p className="text-muted-foreground">Not provided</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedEntry.status)}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Message</label>
                <p className="text-foreground mt-1">
                  {selectedEntry.message || 'No message provided'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Admin Notes</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes (optional)..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Cancel
            </Button>
            {selectedEntry?.status !== 'rejected' && (
              <Button
                variant="destructive"
                onClick={() => handleStatusUpdate(selectedEntry!.id, 'rejected')}
                disabled={processing}
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </>
                )}
              </Button>
            )}
            {selectedEntry?.status !== 'approved' && (
              <Button
                onClick={() => handleStatusUpdate(selectedEntry!.id, 'approved')}
                disabled={processing}
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </>
                )}
              </Button>
            )}
            {selectedEntry?.status === 'approved' && !selectedEntry?.archived_at && (
              <Button
                variant="secondary"
                onClick={() => handleSendAccessEmail(selectedEntry)}
                disabled={processing}
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {selectedEntry.last_invite_sent_at ? 'Re-send access email' : 'Send access email'}
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteConfirmText('');
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes {deleteTarget?.label} from the waitlist for good. It does not delete an
              account that has already signed in. Type DELETE to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="DELETE"
            aria-label="Type DELETE to confirm"
          />
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteTarget(null);
                setDeleteConfirmText('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={processing || deleteConfirmText !== 'DELETE'}
              onClick={handleConfirmDelete}
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
