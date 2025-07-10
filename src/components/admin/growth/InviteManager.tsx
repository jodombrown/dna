import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Mail, 
  Users, 
  Link, 
  Download, 
  UserPlus, 
  CheckCircle, 
  Clock,
  Send
} from 'lucide-react';
import { useInviteSystem } from '@/hooks/useInviteSystem';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WaitlistUser {
  id: string;
  email: string;
  full_name: string;
  status: string;
  location?: string;
  role: string;
  created_at: string;
}

export function InviteManager() {
  const [waitlistUsers, setWaitlistUsers] = useState<WaitlistUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [inviteStats, setInviteStats] = useState({
    total: 0,
    used: 0,
    pending: 0,
    conversionRate: 0
  });
  const [bulkEmails, setBulkEmails] = useState('');
  const [generatedInvites, setGeneratedInvites] = useState<any[]>([]);
  
  const { loading, inviteFromWaitlist, sendBulkInvites, getInviteStats } = useInviteSystem();
  const { toast } = useToast();

  useEffect(() => {
    fetchWaitlistUsers();
    fetchInviteStats();
  }, []);

  const fetchWaitlistUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('waitlist_signups')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWaitlistUsers(data || []);
    } catch (error) {
      console.error('Error fetching waitlist users:', error);
    }
  };

  const fetchInviteStats = async () => {
    const stats = await getInviteStats();
    setInviteStats(stats);
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(waitlistUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleInviteSelected = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "No users selected",
        description: "Please select users to invite",
        variant: "destructive",
      });
      return;
    }

    const invites = await inviteFromWaitlist(selectedUsers);
    if (invites.length > 0) {
      setGeneratedInvites(invites);
      setSelectedUsers([]);
      fetchWaitlistUsers();
      fetchInviteStats();
    }
  };

  const handleBulkInvite = async () => {
    const emails = bulkEmails
      .split('\n')
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));

    if (emails.length === 0) {
      toast({
        title: "No valid emails",
        description: "Please enter valid email addresses",
        variant: "destructive",
      });
      return;
    }

    const invites = await sendBulkInvites(emails);
    if (invites.length > 0) {
      setGeneratedInvites(invites);
      setBulkEmails('');
      fetchInviteStats();
    }
  };

  const exportInvites = () => {
    if (generatedInvites.length === 0) return;

    const csvContent = [
      'Email,Name,Invite Link,Code',
      ...generatedInvites.map(invite => 
        `${invite.email},${invite.name || ''},${invite.inviteLink},${invite.code}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dna-invites-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Invites</p>
                <p className="text-2xl font-bold">{inviteStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold">{inviteStats.used}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{inviteStats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion</p>
                <p className="text-2xl font-bold">{inviteStats.conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Invite Interface */}
      <Tabs defaultValue="waitlist" className="space-y-4">
        <TabsList>
          <TabsTrigger value="waitlist">From Waitlist</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Invite</TabsTrigger>
          <TabsTrigger value="generated">Generated Invites</TabsTrigger>
        </TabsList>

        <TabsContent value="waitlist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Waitlist Users ({waitlistUsers.length})
                <div className="flex gap-2">
                  <Button
                    onClick={handleInviteSelected}
                    disabled={selectedUsers.length === 0 || loading}
                    size="sm"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Selected ({selectedUsers.length})
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedUsers.length === waitlistUsers.length && waitlistUsers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label>Select All</Label>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead></TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {waitlistUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{user.role}</Badge>
                        </TableCell>
                        <TableCell>{user.location || 'Not specified'}</TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Email Invites</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bulk-emails">Email Addresses (one per line)</Label>
                <Textarea
                  id="bulk-emails"
                  placeholder="email1@example.com&#10;email2@example.com&#10;email3@example.com"
                  value={bulkEmails}
                  onChange={(e) => setBulkEmails(e.target.value)}
                  rows={8}
                />
              </div>
              <Button onClick={handleBulkInvite} disabled={loading}>
                <Send className="h-4 w-4 mr-2" />
                Generate Invites
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generated" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Generated Invites ({generatedInvites.length})
                {generatedInvites.length > 0 && (
                  <Button onClick={exportInvites} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generatedInvites.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No invites generated yet. Use the other tabs to create invites.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Invite Link</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {generatedInvites.map((invite, index) => (
                      <TableRow key={index}>
                        <TableCell>{invite.email}</TableCell>
                        <TableCell>{invite.name || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Input
                              value={invite.inviteLink}
                              readOnly
                              className="text-xs"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigator.clipboard.writeText(invite.inviteLink)}
                            >
                              <Link className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`mailto:${invite.email}?subject=You're invited to DNA!&body=Hi,\n\nYou've been invited to join the Diaspora Network of Africa. Click here to join: ${invite.inviteLink}`)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}