import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, MessageSquare, TrendingUp, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Project, ProjectContribution } from '@/types/projectTypes';
import { useToast } from '@/hooks/use-toast';

const ProjectManage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [contributions, setContributions] = useState<ProjectContribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProjectData();
    }
  }, [id]);

  const fetchProjectData = async () => {
    try {
      // Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (projectError) throw projectError;

      // Check if user is the project owner
      const { data: user } = await supabase.auth.getUser();
      if (!user.user || projectData.creator_id !== user.user.id) {
        toast({
          title: "Access Denied",
          description: "You can only manage your own projects",
          variant: "destructive"
        });
        navigate(`/app/projects/${id}`);
        return;
      }

      setProject(projectData);

      // Fetch contributions
      const { data: contributionsData, error: contributionsError } = await supabase
        .from('project_contributions')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false });

      if (contributionsError) throw contributionsError;
      setContributions(contributionsData || []);
    } catch (error) {
      console.error('Error fetching project data:', error);
      toast({
        title: "Error",
        description: "Failed to load project data",
        variant: "destructive"
      });
      navigate('/app/projects');
    } finally {
      setLoading(false);
    }
  };

  const updateContributionStatus = async (contributionId: string, status: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('project_contributions')
        .update({ status })
        .eq('id', contributionId);

      if (error) throw error;

      setContributions(prev => 
        prev.map(contrib => 
          contrib.id === contributionId 
            ? { ...contrib, status }
            : contrib
        )
      );

      toast({
        title: "Success",
        description: `Contribution ${status}`
      });
    } catch (error) {
      console.error('Error updating contribution status:', error);
      toast({
        title: "Error",
        description: "Failed to update contribution status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) return null;

  const pendingContributions = contributions.filter(c => c.status === 'pending');
  const acceptedContributions = contributions.filter(c => c.status === 'accepted');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(`/app/projects/${project.id}`)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">Manage Project</h1>
            <p className="text-muted-foreground mt-1">{project.title}</p>
          </div>
          <Button 
            onClick={() => navigate(`/app/projects/${project.id}/edit`)}
            variant="outline"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Project
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{contributions.length}</p>
                  <p className="text-muted-foreground text-sm">Total Contributions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{pendingContributions.length}</p>
                  <p className="text-muted-foreground text-sm">Pending Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{acceptedContributions.length}</p>
                  <p className="text-muted-foreground text-sm">Active Contributors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contributions Management */}
        <Card>
          <CardHeader>
            <CardTitle>Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending">
              <TabsList>
                <TabsTrigger value="pending">
                  Pending ({pendingContributions.length})
                </TabsTrigger>
                <TabsTrigger value="accepted">
                  Accepted ({acceptedContributions.length})
                </TabsTrigger>
                <TabsTrigger value="all">
                  All ({contributions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4">
                {pendingContributions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No pending contributions
                  </p>
                ) : (
                  pendingContributions.map((contribution) => (
                    <div key={contribution.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={contribution.contributor?.avatar_url} />
                            <AvatarFallback>
                              {contribution.contributor?.full_name?.[0] || 
                               contribution.contributor?.username?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {contribution.contributor?.full_name || 
                               contribution.contributor?.username || 'Anonymous'}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {contribution.contribution_type}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(contribution.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            onClick={() => updateContributionStatus(contribution.id, 'accepted')}
                          >
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateContributionStatus(contribution.id, 'declined')}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm">{contribution.message}</p>
                        
                        {contribution.time_commitment && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Time Commitment:</strong> {contribution.time_commitment}
                          </p>
                        )}
                        
                        {contribution.skills_offered && contribution.skills_offered.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            <strong>Skills:</strong> {contribution.skills_offered.join(', ')}
                          </div>
                        )}
                        
                        {contribution.funding_interest && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Potential Funding:</strong> ${contribution.funding_interest.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="accepted" className="space-y-4">
                {acceptedContributions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No accepted contributors yet
                  </p>
                ) : (
                  acceptedContributions.map((contribution) => (
                    <div key={contribution.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={contribution.contributor?.avatar_url} />
                          <AvatarFallback>
                            {contribution.contributor?.full_name?.[0] || 
                             contribution.contributor?.username?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">
                            {contribution.contributor?.full_name || 
                             contribution.contributor?.username || 'Anonymous'}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {contribution.contribution_type}
                            </Badge>
                            <Badge variant="default">Accepted</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="all" className="space-y-4">
                {contributions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No contributions yet
                  </p>
                ) : (
                  contributions.map((contribution) => (
                    <div key={contribution.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={contribution.contributor?.avatar_url} />
                          <AvatarFallback>
                            {contribution.contributor?.full_name?.[0] || 
                             contribution.contributor?.username?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">
                            {contribution.contributor?.full_name || 
                             contribution.contributor?.username || 'Anonymous'}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {contribution.contribution_type}
                            </Badge>
                            <Badge 
                              variant={
                                contribution.status === 'accepted' ? 'default' :
                                contribution.status === 'declined' ? 'destructive' : 'secondary'
                              }
                            >
                              {contribution.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectManage;