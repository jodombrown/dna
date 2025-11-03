import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FeedLayout } from '@/components/layout/FeedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GroupDetails, GroupPrivacy, GroupJoinPolicy } from '@/types/groups';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
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

export default function GroupSettingsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch group by slug
  const { data: groupData } = useQuery({
    queryKey: ['group-by-slug', slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from('groups')
        .select('id')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const groupId = groupData?.id;

  // Fetch group details
  const { data: group, isLoading } = useQuery({
    queryKey: ['group-details', groupId, user?.id],
    queryFn: async () => {
      if (!groupId || !user) return null;
      const { data, error } = await supabase.rpc('get_group_details', {
        p_group_id: groupId,
        p_user_id: user.id,
      });
      if (error) throw error;
      return data?.[0] as GroupDetails | undefined;
    },
    enabled: !!groupId && !!user,
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    privacy: 'public' as GroupPrivacy,
    join_policy: 'open' as GroupJoinPolicy,
    category: '',
    location: '',
  });

  // Populate form when group loads
  useEffect(() => {
    if (group) {
      // Check if user is admin/owner
      if (!['owner', 'admin'].includes(group.user_role || '')) {
        toast({
          title: 'Access Denied',
          description: 'Only admins can access settings',
          variant: 'destructive',
        });
        navigate(`/dna/convene/groups/${slug}`);
        return;
      }

      setFormData({
        name: group.name,
        description: group.description || '',
        privacy: group.privacy,
        join_policy: group.join_policy,
        category: group.category || '',
        location: group.location || '',
      });
    }
  }, [group, user, slug, navigate, toast]);

  // Update group mutation
  const updateGroupMutation = useMutation({
    mutationFn: async () => {
      if (!groupId || !user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('groups')
        .update({
          name: formData.name,
          description: formData.description || null,
          privacy: formData.privacy,
          join_policy: formData.join_policy,
          category: formData.category || null,
          location: formData.location || null,
        })
        .eq('id', groupId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-details'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast({
        title: 'Settings saved',
        description: 'Group settings have been updated',
      });
    },
    onError: (error: Error) => {
      console.error('Update error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings',
        variant: 'destructive',
      });
    },
  });

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: async () => {
      if (!groupId || !user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('groups')
        .update({ is_active: false })
        .eq('id', groupId)
        .eq('created_by', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Group deleted',
        description: 'The group has been removed',
      });
      navigate('/dna/convene/groups');
    },
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a group name',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    updateGroupMutation.mutate();
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <FeedLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12 text-muted-foreground">
            Loading settings...
          </div>
        </div>
      </FeedLayout>
    );
  }

  if (!group) {
    return (
      <FeedLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Group not found</h2>
            <Button onClick={() => navigate('/dna/convene/groups')}>
              Browse Groups
            </Button>
          </div>
        </div>
      </FeedLayout>
    );
  }

  return (
    <FeedLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/dna/convene/groups/${slug}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Group Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your group settings and preferences
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[hsl(151,75%,50%)] hover:bg-[hsl(151,75%,40%)] text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="privacy">Privacy & Access</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
          </TabsList>

          {/* GENERAL TAB */}
          <TabsContent value="general" className="space-y-4 mt-4">
            <Card className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  maxLength={2000}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Arts & Culture">Arts & Culture</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="Social">Social</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Lagos, Nigeria"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* PRIVACY TAB */}
          <TabsContent value="privacy" className="space-y-4 mt-4">
            <Card className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="privacy">Privacy Level</Label>
                <Select
                  value={formData.privacy}
                  onValueChange={(value) => setFormData({ ...formData, privacy: value as GroupPrivacy })}
                >
                  <SelectTrigger id="privacy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Anyone can find and see content</SelectItem>
                    <SelectItem value="private">Private - Anyone can find, members see content</SelectItem>
                    <SelectItem value="secret">Secret - Invite-only, hidden from search</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="join-policy">Join Policy</Label>
                <Select
                  value={formData.join_policy}
                  onValueChange={(value) => setFormData({ ...formData, join_policy: value as GroupJoinPolicy })}
                >
                  <SelectTrigger id="join-policy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open - Anyone can join instantly</SelectItem>
                    <SelectItem value="approval_required">Approval Required - Admin must approve</SelectItem>
                    <SelectItem value="invite_only">Invite Only - Members must be invited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>
          </TabsContent>

          {/* DANGER ZONE TAB */}
          <TabsContent value="danger" className="space-y-4 mt-4">
            <Card className="p-6 border-destructive">
              <h3 className="text-lg font-semibold mb-2 text-destructive">Danger Zone</h3>
              <p className="text-sm text-muted-foreground mb-4">
                These actions cannot be undone. Please be careful.
              </p>

              {group.user_role === 'owner' && (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Group
                </Button>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this group?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the group, all posts, and remove all members. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteGroupMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Group
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FeedLayout>
  );
}
