import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const createSpace = useCreateSpace();
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check profile strength
    setIsCheckingProfile(true);
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) {
        toast.error('Please log in to create a space');
        return;
      }

      // Get profile strength
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

      // Generate slug from name
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const spaceData = {
        ...formData,
        slug,
        created_by: user.id,
        focus_areas: formData.focus_areas.length > 0 ? formData.focus_areas : [],
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
                  placeholder="Brief description of your space"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of your space goals and activities"
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="space_type">Space Type *</Label>
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
                  placeholder="e.g., East Africa, West Africa"
                />
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
                <Label htmlFor="external_link">External Link (optional)</Label>
                <Input
                  id="external_link"
                  type="url"
                  value={formData.external_link}
                  onChange={(e) => setFormData(prev => ({ ...prev, external_link: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dna/collaborate')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createSpace.isPending || isCheckingProfile}>
                  {(createSpace.isPending || isCheckingProfile) && (
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
