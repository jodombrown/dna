import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

  // Fetch group details
  const { data: group, isLoading } = useQuery({
    queryKey: ['group-details', slug, user?.id],
    queryFn: async () => {
      if (!slug || !user) return null;

      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('id')
        .eq('slug', slug)
        .single();

      if (groupError || !groupData) return null;

      const { data, error } = await supabase.rpc('get_group_details', {
        p_group_id: groupData.id,
        p_user_id: user.id,
      });

      if (error) throw error;
      return data?.[0] as GroupDetails | undefined;
    },
    enabled: !!slug && !!user,
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    privacy: 'public' as GroupPrivacy,
    join_policy: 'open' as GroupJoinPolicy,
    category: '',
    location: '',
  });

  useEffect(() => {
    if (group) {
      // Check permissions
      if (!['owner', 'admin'].includes(group.user_role || '')) {
        toast({
          title: 'Access Denied',
          description: 'Only admins can access group settings',
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

  const updateGroupMutation = useMutation({
    mutationFn: async () => {
      if (!group || !user) throw new Error('Not authenticated');

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
        .eq('id', group.group_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-details'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast({
        title: 'Settings saved!',
        description: 'Your group has been updated',
      });
      navigate(`/dna/convene/groups/${slug}`);
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update group',
        variant: 'destructive',
      });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async () => {
      if (!group || !user) throw new Error('Not authenticated');

      // Only owner can delete
      if (group.user_role !== 'owner') {
        throw new Error('Only owner can delete group');
      }

      const { error } = await supabase
        .from('groups')
        .update({ is_active: false })
        .eq('id', group.group_id)
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
    onError: (error) => {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete group',
        variant: 'destructive',
      });
    },
  });

  if (isLoading || !group) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12 text-muted-foreground">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
            onClick={() => updateGroupMutation.mutate()}
            disabled={isSubmitting}
            className="bg-[hsl(151,75%,50%)] hover:bg-[hsl(151,75%,40%)] text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name</Label>
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

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="culture">Culture & Arts</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="health">Health & Wellness</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="regional">Regional</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Lagos, Nigeria"
                />
              </div>
            </div>
          </Card>

          {/* Privacy Settings */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Privacy & Access</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="privacy">Privacy</Label>
                <Select
                  value={formData.privacy}
                  onValueChange={(value) => setFormData({ ...formData, privacy: value as GroupPrivacy })}
                >
                  <SelectTrigger id="privacy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div>
                        <p className="font-medium">Public</p>
                        <p className="text-xs text-muted-foreground">Anyone can find and view</p>
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div>
                        <p className="font-medium">Private</p>
                        <p className="text-xs text-muted-foreground">Only members can view</p>
                      </div>
                    </SelectItem>
                    <SelectItem value="secret">
                      <div>
                        <p className="font-medium">Secret</p>
                        <p className="text-xs text-muted-foreground">Hidden from search</p>
                      </div>
                    </SelectItem>
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
                    <SelectItem value="open">
                      <div>
                        <p className="font-medium">Open</p>
                        <p className="text-xs text-muted-foreground">Anyone can join</p>
                      </div>
                    </SelectItem>
                    <SelectItem value="approval_required">
                      <div>
                        <p className="font-medium">Approval Required</p>
                        <p className="text-xs text-muted-foreground">Admin approval needed</p>
                      </div>
                    </SelectItem>
                    <SelectItem value="invite_only">
                      <div>
                        <p className="font-medium">Invite Only</p>
                        <p className="text-xs text-muted-foreground">Members must invite</p>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          {group.user_role === 'owner' && (
            <Card className="p-6 border-destructive">
              <h2 className="text-xl font-semibold mb-4 text-destructive">Danger Zone</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Delete Group</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete this group and all its content
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Group
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this group?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the group and all its posts, comments, and data. This action cannot be undone.
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
      </div>
    </div>
  );
}
