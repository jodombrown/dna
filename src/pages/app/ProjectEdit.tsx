import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { ProjectFormData } from '@/types/projectTypes';
import { useToast } from '@/hooks/use-toast';

const ProjectEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    impact_area: '',
    timeline: '',
    skills_needed: [],
    funding_goal: undefined
  });

  const impactAreas = [
    'Healthcare',
    'Education',
    'Agriculture',
    'Technology',
    'Environment',
    'Finance',
    'Infrastructure',
    'Creative Economy'
  ];

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Check if user is the project owner
      const { data: user } = await supabase.auth.getUser();
      if (!user.user || data.creator_id !== user.user.id) {
        toast({
          title: "Access Denied",
          description: "You can only edit your own projects",
          variant: "destructive"
        });
        navigate(`/app/projects/${id}`);
        return;
      }

      setFormData({
        title: data.title,
        description: data.description || '',
        impact_area: data.impact_area || '',
        timeline: '',
        skills_needed: [],
        funding_goal: undefined
      });
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: "Error",
        description: "Failed to load project",
        variant: "destructive"
      });
      navigate('/app/projects');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          title: formData.title,
          description: formData.description,
          impact_area: formData.impact_area || null,
          timeline: formData.timeline || null,
          funding_goal: formData.funding_goal || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project updated successfully!"
      });

      navigate(`/app/projects/${id}`);
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(`/app/projects/${id}`)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Project</h1>
            <p className="text-muted-foreground mt-2">
              Update your project details
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Give your project a compelling name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your project's goals, impact, and how people can contribute"
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="impact_area">Impact Area</Label>
                  <Select 
                    value={formData.impact_area} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, impact_area: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select impact area" />
                    </SelectTrigger>
                    <SelectContent>
                      {impactAreas.map((area) => (
                        <SelectItem key={area} value={area.toLowerCase()}>
                          {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeline">Timeline</Label>
                  <Input
                    id="timeline"
                    value={formData.timeline}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                    placeholder="e.g. 6 months, 1 year"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="funding_goal">Funding Goal (USD)</Label>
                <Input
                  id="funding_goal"
                  type="number"
                  value={formData.funding_goal || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    funding_goal: e.target.value ? parseFloat(e.target.value) : undefined 
                  }))}
                  placeholder="Optional funding target"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(`/app/projects/${id}`)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectEdit;