import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const ProjectCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .insert({
          title: formData.title,
          description: formData.description,
          impact_area: formData.impact_area || null,
          creator_id: user.user.id,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project created successfully!"
      });

      navigate(`/app/projects/${data.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/app/projects')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create Project</h1>
            <p className="text-muted-foreground mt-2">
              Share your vision and connect with contributors
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
                  {loading ? 'Creating...' : 'Create Project'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/app/projects')}
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

export default ProjectCreate;