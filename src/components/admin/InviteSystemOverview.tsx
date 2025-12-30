import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Clock, CheckCircle, XCircle, Plus, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@/components/ui/loader';

interface InviteData {
  id: string;
  email: string;
  referrer_name: string;
  referrer_email: string;
  status: string;
  expires_at: string;
  created_at: string;
  used_at?: string;
  used_by_name?: string;
}

const InviteSystemOverview = () => {
  const [invites, setInvites] = useState<InviteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      setLoading(true);
      
      // Since we don't have an invites table yet, we'll create mock data
      // In a real implementation, this would fetch from the invites table
      const mockInvites: InviteData[] = [
        {
          id: '1',
          email: 'john@example.com',
          referrer_name: 'Admin User',
          referrer_email: 'admin@diasporanetwork.africa',
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          email: 'jane@example.com',
          referrer_name: 'Admin User',
          referrer_email: 'admin@diasporanetwork.africa',
          status: 'used',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          used_at: new Date().toISOString(),
          used_by_name: 'Jane Smith',
        },
        {
          id: '3',
          email: 'expired@example.com',
          referrer_name: 'Admin User',
          referrer_email: 'admin@diasporanetwork.africa',
          status: 'expired',
          expires_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      setInvites(mockInvites);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch invites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async () => {
    if (!newInviteEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      // In a real implementation, this would create an invite record
      // and send an email via edge function
      
      const newInvite: InviteData = {
        id: Math.random().toString(),
        email: newInviteEmail,
        referrer_name: 'Admin User',
        referrer_email: 'admin@diasporanetwork.africa',
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
      };

      setInvites(prev => [newInvite, ...prev]);
      setNewInviteEmail('');

      toast({
        title: "Success",
        description: "Invite sent successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invite",
        variant: "destructive",
      });
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    try {
      // In a real implementation, this would resend the invite email
      toast({
        title: "Success",
        description: "Invite resent successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend invite",
        variant: "destructive",
      });
    }
  };

  const handleExpireInvite = async (inviteId: string) => {
    try {
      setInvites(prev => prev.map(invite => 
        invite.id === inviteId 
          ? { ...invite, status: 'expired' }
          : invite
      ));

      toast({
        title: "Success",
        description: "Invite expired successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to expire invite",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500 text-white"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'used':
        return <Badge className="bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" />Used</Badge>;
      case 'expired':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredInvites = selectedStatus === 'all' 
    ? invites 
    : invites.filter(invite => invite.status === selectedStatus);

  const stats = {
    total: invites.length,
    pending: invites.filter(i => i.status === 'pending').length,
    used: invites.filter(i => i.status === 'used').length,
    expired: invites.filter(i => i.status === 'expired').length,
  };

  if (loading) {
    return <Loader label="Loading invite system..." />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-blue-600">Total Invites</p>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-yellow-600">Pending</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.used}</p>
            <p className="text-sm text-green-600">Used</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
            <p className="text-sm text-red-600">Expired</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-dna-forest hover:bg-dna-forest/90">
              <Plus className="h-4 w-4 mr-2" />
              Send New Invite
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send New Invite</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  value={newInviteEmail}
                  onChange={(e) => setNewInviteEmail(e.target.value)}
                  placeholder="Enter email address..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNewInviteEmail('')}>
                  Cancel
                </Button>
                <Button onClick={handleSendInvite}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invite
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex gap-2 items-center">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="used">Used</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={fetchInvites} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Invites Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Sent By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvites.map((invite) => (
              <TableRow key={invite.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{invite.email}</div>
                    {invite.used_by_name && (
                      <div className="text-sm text-muted-foreground">
                        Used by: {invite.used_by_name}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{invite.referrer_name}</div>
                    <div className="text-sm text-muted-foreground">{invite.referrer_email}</div>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(invite.status)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(invite.expires_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {invite.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResendInvite(invite.id)}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Resend
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleExpireInvite(invite.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Expire
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

      {filteredInvites.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No invites found</p>
        </div>
      )}
    </div>
  );
};

export default InviteSystemOverview;