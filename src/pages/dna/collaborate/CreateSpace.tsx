import { useState, useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LayoutController from '@/components/LayoutController';
import { LeftNav } from '@/components/layout/columns/LeftNav';
import { RightWidgets } from '@/components/layout/columns/RightWidgets';
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
  const { trackEvent } = useAnalytics();
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
        space_type: formData.space_type as 'project' | 'working_group' | 'initiative' | 'program',
        status: formData.status as 'idea' | 'active' | 'completed' | 'paused',
        visibility: formData.visibility as 'public' | 'invite_only',
        focus_areas: formData.focus_areas.length > 0 ? formData.focus_areas : [],
        region: formData.region,
        external_link: formData.external_link,
        slug,
        created_by: user.id,
        origin_event_id: formData.origin_event_id || undefined,
        origin_group_id: formData.origin_group_id || undefined,
      };

      const result = await createSpace.mutateAsync(spaceData);
      
      // Track analytics for cross-C flows
      if (formData.origin_event_id) {
        await trackEvent('event_to_space_created', {
          event_id: formData.origin_event_id,
          space_id: result.id,
        });
      } else if (formData.origin_group_id) {
        await trackEvent('group_to_space_created', {
          group_id: formData.origin_group_id,
          space_id: result.id,
        });
      }

      navigate(`/dna/collaborate/spaces/${result.slug}`);
    } catch (error: unknown) {
      // Error handled by mutation
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
      <LayoutController
        leftColumn={<LeftNav />}
        centerColumn={
          <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
        rightColumn={<RightWidgets />}
      />
    );
  }

  return (
    <LayoutController
      leftColumn={<LeftNav />}
      centerColumn={
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create a New Space</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Space Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Pan-African Tech Innovation Hub"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="A one-line description of your space"
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What is this space about? What are you trying to achieve?"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="space_type">Space Type *</Label>
                    <Select
                      value={formData.space_type}
                      onValueChange={(value) => setFormData({ ...formData, space_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="initiative">Initiative</SelectItem>
                        <SelectItem value="coalition">Coalition</SelectItem>
                        <SelectItem value="working_group">Working Group</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="idea">Idea</SelectItem>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibility *</Label>
                  <Select
                    value={formData.visibility}
                    onValueChange={(value) => setFormData({ ...formData, visibility: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Anyone can see and join</SelectItem>
                      <SelectItem value="private">Private - Only members can see</SelectItem>
                      <SelectItem value="invite_only">Invite Only - Visible but request to join</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="focus_areas">Focus Areas (comma-separated)</Label>
                  <Input
                    id="focus_areas"
                    value={formData.focus_areas.join(', ')}
                    onChange={(e) => handleFocusAreasChange(e.target.value)}
                    placeholder="e.g., Climate Action, Youth Empowerment, Innovation"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Region/Country</Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="e.g., West Africa, Kenya, Global"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="external_link">External Link (optional)</Label>
                  <Input
                    id="external_link"
                    type="url"
                    value={formData.external_link}
                    onChange={(e) => setFormData({ ...formData, external_link: e.target.value })}
                    placeholder="https://yourproject.com"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    disabled={createSpace.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createSpace.isPending}
                  >
                    {createSpace.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Space'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      }
      rightColumn={<RightWidgets />}
    />
  );
}
