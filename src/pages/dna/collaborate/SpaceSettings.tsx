import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSpaceBySlug } from '@/hooks/useSpaces';
import { useUpdateSpace } from '@/hooks/useSpaceMutations';
import { SpaceMembers } from '@/components/collaboration/SpaceMembers';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function SpaceSettings() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: space, isLoading } = useSpaceBySlug(slug || '');
  const updateSpace = useUpdateSpace();
  const [isLead, setIsLead] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    space_type: 'project',
    status: 'active',
    visibility: 'public',
    focus_areas: [] as string[],
    region: '',
    external_link: '',
  });

  useEffect(() => {
    async function checkLeadAccess() {
      if (!space) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/dna/collaborate');
        return;
      }

      const { data: membership } = await (supabase
        .from('space_members')
        .select('role')
        .eq('space_id', space.id)
        .eq('user_id', user.id)
        .single() as any);

      if (!membership || membership.role !== 'lead') {
        toast.error('You must be a lead to access settings');
        navigate(`/dna/collaborate/spaces/${slug}`);
        return;
      }

      setIsLead(true);
      setCheckingAccess(false);
    }

    checkLeadAccess();
  }, [space, slug, navigate]);

  useEffect(() => {
    if (space) {
      setFormData({
        name: space.name || '',
        tagline: space.tagline || '',
        description: space.description || '',
        space_type: space.space_type || 'project',
        status: space.status || 'active',
        visibility: space.visibility || 'public',
        focus_areas: space.focus_areas || [],
        region: space.region || '',
        external_link: space.external_link || '',
      });
    }
  }, [space]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!space) return;

    await updateSpace.mutateAsync({
      id: space.id,
      updates: {
        ...formData,
        updated_at: new Date().toISOString(),
      },
    });
  };

  const handleFocusAreasChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      focus_areas: value.split(',').map(s => s.trim()).filter(Boolean),
    }));
  };

  if (isLoading || checkingAccess) {
    return (
      <FeedLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </FeedLayout>
    );
  }

  if (!space || !isLead) {
    return null;
  }

  return (
    <FeedLayout>
      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/dna/collaborate/spaces/${slug}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Space
          </Button>
        </div>

        <div>
          <h1 className="text-4xl font-bold">Space Settings</h1>
          <p className="text-muted-foreground mt-2">{space.name}</p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline *</Label>
                    <Input
                      id="tagline"
                      required
                      value={formData.tagline}
                      onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
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
                    <Label htmlFor="external_link">External Link</Label>
                    <Input
                      id="external_link"
                      type="url"
                      value={formData.external_link}
                      onChange={(e) => setFormData(prev => ({ ...prev, external_link: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={updateSpace.isPending}>
                      {updateSpace.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Member Management</CardTitle>
              </CardHeader>
              <CardContent>
                <SpaceMembers spaceId={space.id} canManage={true} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </FeedLayout>
  );
}
