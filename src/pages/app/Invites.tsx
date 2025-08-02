import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Copy, Send, Clock, CheckCircle, Users, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@/components/ui/loader';

interface Invite {
  id: string;
  email: string;
  code: string;
  role: string;
  referral_code?: string;
  created_by: string;
  used_by_id?: string;
  used_at?: string;
  expires_at: string;
  created_at: string;
}

const Invites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    used: 0,
    remaining: 5
  });

  useEffect(() => {
    if (user) {
      fetchInvites();
    }
  }, [user]);

  const fetchInvites = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const inviteData = data || [];
      setInvites(inviteData as Invite[]);
      
      setStats({
        total: inviteData.length,
        pending: inviteData.filter(i => !i.used_at).length,
        used: inviteData.filter(i => i.used_at).length,
        remaining: Math.max(0, 5 - inviteData.length) // 5 invite limit
      });
    } catch (error) {
      console.error('Error fetching invites:', error);
      toast({
        title: "Error",
        description: "Failed to load invites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async () => {
    if (!newEmail || !user) return;
    
    if (stats.remaining <= 0) {
      toast({
        title: "Invite Limit Reached",
        description: "You've reached your invite limit",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      // Use a simple 8-character code
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const { error } = await supabase
        .from('invites')
        .insert({
          created_by: user.id,
          email: newEmail,
          code: inviteCode,
          role: 'user',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      toast({
        title: "Invite Sent!",
        description: `Invitation sent to ${newEmail}`,
      });

      setNewEmail('');
      fetchInvites();
    } catch (error) {
      console.error('Error sending invite:', error);
      toast({
        title: "Error",
        description: "Failed to send invite",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const copyReferralLink = (code: string) => {
    const link = `${window.location.origin}/invite?ref=${code}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const getStatusBadge = (invite: Invite) => {
    if (invite.used_at) {
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Used</Badge>;
    }
    const isExpired = new Date(invite.expires_at) < new Date();
    if (isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    return <Badge variant="outline" className="text-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
  };

  if (loading) {
    return <Loader label="Loading invites..." />;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dna-forest mb-2">Invite Friends to DNA</h1>
        <p className="text-muted-foreground">
          Share DNA with your network and help build Africa's digital diaspora community.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-dna-forest">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Sent</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.used}</div>
            <div className="text-sm text-muted-foreground">Joined</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-dna-emerald">{stats.remaining}</div>
            <div className="text-sm text-muted-foreground">Remaining</div>
          </CardContent>
        </Card>
      </div>

      {/* Send New Invite */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send New Invite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              type="email"
              placeholder="Enter email address..."
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              disabled={stats.remaining <= 0}
            />
            <Button 
              onClick={sendInvite} 
              disabled={!newEmail || sending || stats.remaining <= 0}
              className="bg-dna-forest hover:bg-dna-forest/90"
            >
              {sending ? <Loader /> : <Send className="h-4 w-4 mr-2" />}
              Send
            </Button>
          </div>
          {stats.remaining <= 0 && (
            <p className="text-sm text-red-600 mt-2">
              You've reached your invite limit. Contact support for more invites.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Invites Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Invites
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invites.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No invites sent yet</p>
              <p className="text-sm text-muted-foreground">Send your first invite above!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell className="font-medium">{invite.email}</TableCell>
                    <TableCell>{getStatusBadge(invite)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(invite.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(invite.expires_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyReferralLink(invite.code)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy Link
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Invites;