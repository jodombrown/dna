import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Users, Heart, Share, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/projectTypes';
import { useToast } from '@/hooks/use-toast';
import ContributionForm from '@/components/projects/ContributionForm';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [showContributionForm, setShowContributionForm] = useState(false);

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
      setProject(data);

      // Check if current user is the project owner
      const { data: user } = await supabase.auth.getUser();
      if (user.user && data.creator_id === user.user.id) {
        setIsOwner(true);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: "Error",
        description: "Failed to load project",
        variant: "destructive"
      });
      navigate('/app/projects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Project not found</h2>
          <Button onClick={() => navigate('/app/projects')}>
            Back to Projects
          </Button>
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
            onClick={() => navigate('/app/projects')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{project.title}</h1>
              {project.impact_area && (
                <Badge variant="secondary">{project.impact_area}</Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {isOwner && (
              <>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => navigate(`/app/projects/${project.id}/edit`)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => navigate(`/app/projects/${project.id}/manage`)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button variant="outline" size="icon">
              <Share className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Project</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{project.description}</p>
              </CardContent>
            </Card>

            {/* Contribution Form */}
            {!isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle>Contribute to This Project</CardTitle>
                </CardHeader>
                <CardContent>
                  {!showContributionForm ? (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-4">
                        Ready to make an impact? Let the project owner know how you'd like to contribute.
                      </p>
                      <Button onClick={() => setShowContributionForm(true)}>
                        <Heart className="w-4 h-4 mr-2" />
                        I Want to Contribute
                      </Button>
                    </div>
                  ) : (
                    <ContributionForm 
                      projectId={project.id}
                      onSuccess={() => {
                        setShowContributionForm(false);
                        toast({
                          title: "Success",
                          description: "Your contribution request has been sent!"
                        });
                      }}
                      onCancel={() => setShowContributionForm(false)}
                    />
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Creator */}
            <Card>
              <CardHeader>
                <CardTitle>Project Creator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={project.creator?.avatar_url} />
                    <AvatarFallback>
                      {project.creator?.full_name?.[0] || project.creator?.username?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {project.creator?.full_name || project.creator?.username || 'Anonymous'}
                    </p>
                    <p className="text-sm text-muted-foreground">Project Owner</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Project Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                    {project.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contributors</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    0 {/* TODO: Count from contributions */}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;