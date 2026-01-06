import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserPlus,
  Crown,
  Shield,
  Clipboard,
  QrCode,
  Megaphone,
  MoreHorizontal,
  Trash2,
  Mail,
  Loader2,
  Check
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useEventManagement } from '../EventManagementLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profile: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
    email?: string;
  } | null;
}

interface RoleDefinition {
  value: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  permissions: string[];
}

const ROLES: RoleDefinition[] = [
  {
    value: 'co-host',
    label: 'Co-host',
    description: 'Full access including team management and settings',
    icon: Crown,
    permissions: ['overview', 'attendees', 'check-in', 'communications', 'analytics', 'team', 'settings'],
  },
  {
    value: 'manager',
    label: 'Manager',
    description: 'Manage attendees and communications',
    icon: Clipboard,
    permissions: ['overview', 'attendees', 'check-in', 'communications', 'analytics'],
  },
  {
    value: 'check-in',
    label: 'Check-in Staff',
    description: 'Check-in attendees only',
    icon: QrCode,
    permissions: ['check-in'],
  },
  {
    value: 'promoter',
    label: 'Promoter',
    description: 'View overview and basic analytics',
    icon: Megaphone,
    permissions: ['overview', 'analytics'],
  },
];

const TeamManager: React.FC = () => {
  const { event, isOrganizer } = useEventManagement();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('manager');
  const [inviteMessage, setInviteMessage] = useState('');
  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null);
  const [changingRole, setChangingRole] = useState<{ memberId: string; newRole: string } | null>(null);

  // Fetch team members
  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ['event-team', event.id],
    queryFn: async (): Promise<TeamMember[]> => {
      const { data: roles, error } = await supabase
        .from('event_roles')
        .select('*')
        .eq('event_id', event.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (!roles || roles.length === 0) return [];

      // Fetch profiles
      const userIds = roles.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return roles.map(r => ({
        ...r,
        profile: profileMap.get(r.user_id) || null,
      })) as TeamMember[];
    },
    enabled: !!event.id,
  });

  // Fetch organizer profile
  const { data: organizer } = useQuery({
    queryKey: ['event-organizer', event.organizer_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .eq('id', event.organizer_id)
        .maybeSingle();
      return data;
    },
    enabled: !!event.organizer_id,
  });

  // Invite team member mutation
  const inviteMutation = useMutation({
    mutationFn: async () => {
      // First, find user by email
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .ilike('id', inviteEmail) // This is a simplification - in real app, query by email
        .maybeSingle();

      // For now, we'll search by username as email isn't directly queryable
      const { data: userByUsername } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', inviteEmail.split('@')[0])
        .maybeSingle();

      const userId = profiles?.id || userByUsername?.id;

      if (!userId) {
        // TODO: In production, send email invite
        throw new Error('User not found. They must have a DNA account.');
      }

      // Check if already a team member
      const { data: existing } = await supabase
        .from('event_roles')
        .select('id')
        .eq('event_id', event.id)
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        throw new Error('This user is already a team member');
      }

      // Add team member
      const { error } = await supabase
        .from('event_roles')
        .insert({
          event_id: event.id,
          user_id: userId,
          role: inviteRole,
        });

      if (error) throw error;

      // TODO: Send notification to invited user
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-team', event.id] });
      toast({ title: 'Team member added', description: 'The team member has been added successfully.' });
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('manager');
      setInviteMessage('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add team member.',
        variant: 'destructive',
      });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, newRole }: { memberId: string; newRole: string }) => {
      const { error } = await supabase
        .from('event_roles')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-team', event.id] });
      toast({ title: 'Role updated', description: 'Team member role has been updated.' });
      setChangingRole(null);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update role.', variant: 'destructive' });
    },
  });

  // Remove team member mutation
  const removeMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('event_roles')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-team', event.id] });
      toast({ title: 'Team member removed', description: 'The team member has been removed.' });
      setRemoveMemberId(null);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to remove team member.', variant: 'destructive' });
    },
  });

  const getRoleDefinition = (role: string): RoleDefinition | undefined => {
    return ROLES.find(r => r.value === role);
  };

  const getRoleBadge = (role: string) => {
    const def = getRoleDefinition(role);
    if (!def) return <Badge variant="outline">{role}</Badge>;

    const Icon = def.icon;
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {def.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-muted-foreground">Manage who can help run your event</p>
        </div>
        <Button onClick={() => setShowInviteModal(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Team Member
        </Button>
      </div>

      {/* Role Descriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Team Roles</CardTitle>
          <CardDescription>Different roles have different access levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ROLES.map((role) => {
              const Icon = role.icon;
              return (
                <div
                  key={role.value}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{role.label}</p>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {role.permissions.map((perm) => (
                        <Badge key={perm} variant="outline" className="text-xs capitalize">
                          {perm}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Owner (Organizer) */}
          {organizer && (
            <div className="flex items-center justify-between p-4 rounded-lg border bg-primary/5 border-primary/20">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={organizer.avatar_url || ''} />
                  <AvatarFallback>{organizer.full_name?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{organizer.full_name}</p>
                  <p className="text-sm text-muted-foreground">@{organizer.username}</p>
                </div>
              </div>
              <Badge className="flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Owner
              </Badge>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Team Members List */}
          {!isLoading && teamMembers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No team members yet</p>
              <p className="text-sm">Invite people to help manage your event</p>
            </div>
          )}

          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.profile?.avatar_url || ''} />
                  <AvatarFallback>
                    {member.profile?.full_name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {member.profile?.full_name || 'Unknown'}
                  </p>
                  {member.profile?.username && (
                    <p className="text-sm text-muted-foreground">@{member.profile.username}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Added {format(new Date(member.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getRoleBadge(member.role)}
                {isOrganizer && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setChangingRole({ memberId: member.id, newRole: member.role })}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Change Role
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setRemoveMemberId(member.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Invite Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Add someone to help manage your event
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email or Username</Label>
              <Input
                id="invite-email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@example.com or username"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        <role.icon className="h-4 w-4" />
                        {role.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {getRoleDefinition(inviteRole)?.description}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-message">Personal Message (optional)</Label>
              <Textarea
                id="invite-message"
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="Add a personal note to your invitation"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => inviteMutation.mutate()}
              disabled={!inviteEmail.trim() || inviteMutation.isPending}
            >
              {inviteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Modal */}
      <Dialog open={!!changingRole} onOpenChange={(open) => !open && setChangingRole(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>
              Update the team member's role and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Role</Label>
              <Select
                value={changingRole?.newRole}
                onValueChange={(value) =>
                  setChangingRole(prev => prev ? { ...prev, newRole: value } : null)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        <role.icon className="h-4 w-4" />
                        {role.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {changingRole && getRoleDefinition(changingRole.newRole)?.description}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangingRole(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => changingRole && updateRoleMutation.mutate(changingRole)}
              disabled={updateRoleMutation.isPending}
            >
              {updateRoleMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation */}
      <AlertDialog open={!!removeMemberId} onOpenChange={(open) => !open && setRemoveMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove their access to manage this event. They can be re-invited later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removeMemberId && removeMutation.mutate(removeMemberId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeamManager;
