import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FeedLayout } from '@/components/layout/FeedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateSpace } from '@/hooks/useSpaceMutations';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function CreateSpace() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createSpace = useCreateSpace();
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  const [isPrefilling, setIsPrefilling] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    space_type: 'project',
    status: 'idea',
    visibility: 'public',
    focus_areas: [] as string[],
    region: '',
    external_link: '',
    origin_event_id: undefined as string | undefined,
    origin_group_id: undefined as string | undefined,
  });

  useEffect(() => {
    const fromEventId = searchParams.get('from_event_id');
    const fromGroupId = searchParams.get('from_group_id');

    if (fromEventId) {
      prefillFromEvent(fromEventId);
    } else if (fromGroupId) {
      prefillFromGroup(fromGroupId);
    }
  }, [searchParams]);

  const prefillFromEvent = async (eventId: string) => {
    setIsPrefilling(true);
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return;

      const { data: event, error } = await supabaseClient
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;

      if (event.organizer_id !== user.id) {
        toast.error('Only event organizers can create spaces from events');
        navigate('/dna/collaborate/spaces/new');
        return;
      }

      setFormData(prev => ({
        ...prev,
        name: `Project – ${event.title}`,
        tagline: `Project space for ${event.title}`,
        description: event.description || '',
        region: event.location_city || event.location_country || '',
        origin_event_id: eventId,
      }));
    } catch (error) {
      console.error('Error prefilling from event:', error);
      toast.error('Failed to load event details');
    } finally {
      setIsPrefilling(false);
    }
  };

  const prefillFromGroup = async (groupId: string) => {
    setIsPrefilling(true);
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return;

      const { data: group, error: groupError } = await supabaseClient
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      const { data: membership } = await supabaseClient
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();

      if (!membership || !['owner', 'admin'].includes(membership.role)) {
        toast.error('Only group admins can create spaces from groups');
        navigate('/dna/collaborate/spaces/new');
        return;
      }

      setFormData(prev => ({
        ...prev,
        name: `${group.name} – Working Group`,
        tagline: `Space for ${group.name} project work`,
        description: group.description || '',
        origin_group_id: groupId,
      }));
    } catch (error) {
      console.error('Error prefilling from group:', error);
      toast.error('Failed to load group details');
    } finally {
      setIsPrefilling(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsCheckingProfile(true);
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) {
        toast.error('Please log in to create a space');
        return;
      }

      const { data: strengthData, error: strengthError } = await supabaseClient
        .rpc('calculate_profile_strength', { user_id: user.id });

      if (strengthError) throw strengthError;

      const profileStrength = strengthData || 0;
      if (profileStrength < 40) {
        toast.error('Please complete at least 40% of your profile to create a space', {
          description: 'Update your profile to include more information about yourself',
          action: {
            label: 'Complete Profile',
            onClick: () => navigate('/profile/edit'),
          },
        });
        return;
      }

      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const spaceData = {
        name: formData.name,
        tagline: formData.tagline,
        description: formData.description,
        space_type: formData.space_type,
        status: formData.status,
        visibility: formData.visibility,
        focus_areas: formData.focus_areas.length > 0 ? formData.focus_areas : [],
        region: formData.region,
        external_link: formData.external_link,
        slug,
        created_by: user.id,
        origin_event_id: formData.origin_event_id || null,
        origin_group_id: formData.origin_group_id || null,
      };

      const result = await createSpace.mutateAsync(spaceData);
      navigate(`/dna/collaborate/spaces/${result.slug}`);
    } catch (error: any) {
      console.error('Error creating space:', error);
    } finally {
      setIsCheckingProfile(false);
    }
  };

  const handleFocusAreasChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      focus_areas: value.split(',').map(s => s.trim()).filter(Boolean),
    }));
  };

  if (isPrefilling) {
    return (
      <FeedLayout>
        <div className="container max-w-3xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
              <p className="text-muted-foreground">Loading details...</p>
            </CardContent>
          </Card>
        </div>
      </FeedLayout>
    );
  }

  return (
    <FeedLayout>
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Space</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Space Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter space name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Short Tagline *</Label>
                <Input
                  id="tagline"
                  required
                  value={formData.tagline}
                  onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                  placeholder="Brief one-liner about this space"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this space is about..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="space_type">Type *</Label>
                  <Select
                    value={formData.space_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, space_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="working_group">Working Group</SelectItem>
                      <SelectItem value="initiative">Initiative</SelectItem>
                      <SelectItem value="program">Program</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="idea">Idea</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility *</Label>
                <Select
                  value={formData.visibility}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, visibility: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="invite_only">Invite Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="focus_areas">Focus Areas (comma-separated)</Label>
                <Input
                  id="focus_areas"
                  value={formData.focus_areas.join(', ')}
                  onChange={(e) => handleFocusAreasChange(e.target.value)}
                  placeholder="e.g., Education, Technology, Healthcare"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  value={formData.region}
                  onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                  placeholder="e.g., West Africa, East Africa, Global"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="external_link">External Link (optional)</Label>
                <Input
                  id="external_link"
                  type="url"
                  value={formData.external_link}
                  onChange={(e) => setFormData(prev => ({ ...prev, external_link: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dna/collaborate')}
                  disabled={isCheckingProfile || createSpace.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCheckingProfile || createSpace.isPending}
                  className="flex-1"
                >
                  {(isCheckingProfile || createSpace.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Space
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </FeedLayout>
  );
}
