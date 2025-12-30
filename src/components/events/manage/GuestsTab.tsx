import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { SearchIcon, DownloadIcon, MailIcon, CheckIcon, XIcon, UsersIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Guest {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  registered_at: string;
  status: 'going' | 'pending' | 'waitlist' | 'cancelled';
  ticket_type?: string;
  answers?: any;
}

interface GuestsTabProps {
  eventId: string;
}

const GuestsTab: React.FC<GuestsTabProps> = ({ eventId }) => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());

  const fetchGuests = async () => {
    try {
      // Pull registrations with status for this event
      const { data: regs, error: regErr } = await supabase
        .from('event_registrations')
        .select('user_id, status, registered_at')
        .eq('event_id', eventId);
      if (regErr) throw regErr;

      const userIds = (regs || []).map(r => r.user_id);
      let profilesMap: Record<string, { username: string; full_name: string }> = {};
      if (userIds.length > 0) {
        const { data: profiles, error: profErr } = await supabase
          .from('profiles')
          .select('id, username, full_name')
          .in('id', userIds);
        if (profErr) throw profErr;
        profilesMap = (profiles || []).reduce((acc: any, p: any) => {
          acc[p.id] = { username: p.username || 'unknown', full_name: p.full_name || p.username || 'Unknown' };
          return acc;
        }, {} as Record<string, { username: string; full_name: string }>);
      }

      const formattedGuests: Guest[] = (regs || []).map((r: any) => ({
        id: r.user_id,
        user_id: r.user_id,
        username: profilesMap[r.user_id]?.username || 'unknown',
        full_name: profilesMap[r.user_id]?.full_name || 'Unknown',
        registered_at: r.registered_at,
        status: (r.status as Guest['status']) || 'going',
      }));

      setGuests(formattedGuests);
    } catch (error) {
      toast.error('Failed to load guests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [eventId]);

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || guest.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectGuest = (guestId: string) => {
    const newSelected = new Set(selectedGuests);
    if (newSelected.has(guestId)) {
      newSelected.delete(guestId);
    } else {
      newSelected.add(guestId);
    }
    setSelectedGuests(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedGuests.size === filteredGuests.length) {
      setSelectedGuests(new Set());
    } else {
      setSelectedGuests(new Set(filteredGuests.map(g => g.id)));
    }
  };

  const setStatus = async (userId: string, status: Guest['status']) => {
    try {
      const { error } = await supabase.rpc('rpc_event_set_status', {
        p_event: eventId,
        p_user: userId,
        p_status: status,
      });
      if (error) throw error;
      toast.success(`Updated status to ${status}`);
      await fetchGuests();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedGuests.size === 0) {
      toast.error('No guests selected');
      return;
    }

    try {
      await Promise.all(Array.from(selectedGuests).map(uid => setStatus(uid, 'going')));
      setSelectedGuests(new Set());
    } catch (error) {
      toast.error('Failed to approve guests');
    }
  };

  const handleBulkDecline = async () => {
    if (selectedGuests.size === 0) {
      toast.error('No guests selected');
      return;
    }

    try {
      await Promise.all(Array.from(selectedGuests).map(uid => setStatus(uid, 'cancelled')));
      setSelectedGuests(new Set());
    } catch (error) {
      toast.error('Failed to decline guests');
    }
  };
  const handleExportGuests = () => {
    const csvContent = [
      ['Name', 'Username', 'Status', 'Registered At'],
      ...filteredGuests.map(guest => [
        guest.full_name,
        guest.username,
        guest.status,
        new Date(guest.registered_at).toLocaleDateString(),
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-${eventId}-guests.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      going: 'default',
      pending: 'secondary',
      waitlist: 'outline',
      declined: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <UsersIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Loading guests...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{guests.length}</p>
              <p className="text-sm text-muted-foreground">Total Registered</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {guests.filter(g => g.status === 'going').length}
              </p>
              <p className="text-sm text-muted-foreground">Confirmed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {guests.filter(g => g.status === 'pending').length}
              </p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {guests.filter(g => g.status === 'waitlist').length}
              </p>
              <p className="text-sm text-muted-foreground">Waitlisted</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Guest Management</span>
            <div className="flex items-center space-x-2">
              <Button onClick={handleExportGuests} variant="outline" size="sm">
                <DownloadIcon className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <MailIcon className="w-4 h-4 mr-2" />
                Email All
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search guests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="going">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="waitlist">Waitlisted</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedGuests.size > 0 && (
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {selectedGuests.size} selected
              </span>
              <Button onClick={handleBulkApprove} size="sm" variant="outline">
                <CheckIcon className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button onClick={handleBulkDecline} size="sm" variant="outline">
                <XIcon className="w-4 h-4 mr-2" />
                Decline
              </Button>
            </div>
          )}

          {/* Guests Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedGuests.size === filteredGuests.length && filteredGuests.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuests.map((guest) => (
                  <TableRow key={guest.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedGuests.has(guest.id)}
                        onCheckedChange={() => handleSelectGuest(guest.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{guest.full_name}</p>
                        <p className="text-sm text-muted-foreground">@{guest.username}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(guest.status)}</TableCell>
                    <TableCell>
                      {new Date(guest.registered_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {guest.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => setStatus(guest.user_id, 'going')}>
                              <CheckIcon className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setStatus(guest.user_id, 'cancelled')}>
                              <XIcon className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredGuests.length === 0 && (
            <div className="text-center py-8">
              <UsersIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">No guests found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestsTab;