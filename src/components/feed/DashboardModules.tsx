import { DashboardModule } from '@/hooks/useDashboardPreferences';
import { ResumeModule } from './ResumeModule';
import { TrendingHashtags } from './TrendingHashtags';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, HandHeart, UserPlus, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLiveEvents } from '@/hooks/useLiveEvents';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ModulesProps {
  visibleModules: DashboardModule[];
  collapsedModules: DashboardModule[];
  density: 'standard' | 'compact';
}

export function DashboardModules({ visibleModules, collapsedModules, density }: ModulesProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events: upcomingEvents } = useLiveEvents(3);

  const { data: recommendedSpaces } = useQuery({
    queryKey: ['recommended-spaces', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('collaboration_spaces')
        .select('*')
        .eq('visibility', 'public')
        .eq('status', 'active')
        .limit(3);
      return data || [];
    },
    enabled: !!user && visibleModules.includes('recommended_spaces'),
  });

  const { data: openNeeds } = useQuery({
    queryKey: ['open-needs', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('contribution_needs')
        .select('*, spaces(title)')
        .eq('status', 'open')
        .limit(3);
      return data || [];
    },
    enabled: !!user && visibleModules.includes('open_needs'),
  });

  const { data: suggestedPeople } = useQuery({
    queryKey: ['suggested-people', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, username, avatar_url, bio')
        .neq('id', user?.id || '')
        .limit(3);
      return data || [];
    },
    enabled: !!user && visibleModules.includes('suggested_people'),
  });

  const isCompact = density === 'compact';

  const renderModule = (module: DashboardModule) => {
    const isCollapsed = collapsedModules.includes(module);
    if (isCollapsed) return null;

    switch (module) {
      case 'resume_section':
        return <ResumeModule key={module} />;

      case 'upcoming_events':
        return (
          <Card key={module}>
            <CardHeader className={isCompact ? 'pb-3' : ''}>
              <CardTitle className={`flex items-center gap-2 ${isCompact ? 'text-sm' : 'text-base'}`}>
                <Calendar className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className={isCompact ? 'pt-0' : ''}>
              {upcomingEvents && upcomingEvents.length > 0 ? (
                <div className="space-y-2">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="text-sm cursor-pointer hover:text-primary transition-colors"
                      onClick={() => navigate(`/dna/convene/events/${event.id}`)}
                    >
                      <p className="font-medium truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.start_time).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3"
                onClick={() => navigate('/dna/convene')}
              >
                View All Events
              </Button>
            </CardContent>
          </Card>
        );

      case 'recommended_spaces':
        return (
          <Card key={module}>
            <CardHeader className={isCompact ? 'pb-3' : ''}>
              <CardTitle className={`flex items-center gap-2 ${isCompact ? 'text-sm' : 'text-base'}`}>
                <Users className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} />
                Recommended Spaces
              </CardTitle>
            </CardHeader>
            <CardContent className={isCompact ? 'pt-0' : ''}>
              {recommendedSpaces && recommendedSpaces.length > 0 ? (
                <div className="space-y-2">
                  {recommendedSpaces.map((space: any) => (
                    <div
                      key={space.id}
                      className="text-sm cursor-pointer hover:text-primary transition-colors"
                      onClick={() => navigate(`/dna/collaborate/spaces/${space.id}`)}
                    >
                      <p className="font-medium truncate">{space.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {space.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No spaces yet</p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3"
                onClick={() => navigate('/dna/collaborate')}
              >
                Explore Spaces
              </Button>
            </CardContent>
          </Card>
        );

      case 'open_needs':
        return (
          <Card key={module}>
            <CardHeader className={isCompact ? 'pb-3' : ''}>
              <CardTitle className={`flex items-center gap-2 ${isCompact ? 'text-sm' : 'text-base'}`}>
                <HandHeart className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} />
                Open Needs
              </CardTitle>
            </CardHeader>
            <CardContent className={isCompact ? 'pt-0' : ''}>
              {openNeeds && openNeeds.length > 0 ? (
                <div className="space-y-2">
                  {openNeeds.map((need: any) => (
                    <div
                      key={need.id}
                      className="text-sm cursor-pointer hover:text-primary transition-colors"
                      onClick={() => navigate(`/dna/contribute/needs/${need.id}`)}
                    >
                      <p className="font-medium truncate">{need.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {need.spaces?.title || 'Unknown space'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No open needs</p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3"
                onClick={() => navigate('/dna/contribute')}
              >
                View All Needs
              </Button>
            </CardContent>
          </Card>
        );

      case 'suggested_people':
        return (
          <Card key={module}>
            <CardHeader className={isCompact ? 'pb-3' : ''}>
              <CardTitle className={`flex items-center gap-2 ${isCompact ? 'text-sm' : 'text-base'}`}>
                <UserPlus className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} />
                Suggested People
              </CardTitle>
            </CardHeader>
            <CardContent className={isCompact ? 'pt-0' : ''}>
              {suggestedPeople && suggestedPeople.length > 0 ? (
                <div className="space-y-2">
                  {suggestedPeople.map((person: any) => (
                    <div
                      key={person.id}
                      className="text-sm cursor-pointer hover:text-primary transition-colors"
                      onClick={() => navigate(`/dna/${person.username}`)}
                    >
                      <p className="font-medium truncate">
                        {person.display_name || person.username}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {person.bio || 'DNA Member'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No suggestions</p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3"
                onClick={() => navigate('/dna/connect')}
              >
                Discover People
              </Button>
            </CardContent>
          </Card>
        );

      case 'recent_stories':
        return (
          <Card key={module}>
            <CardHeader className={isCompact ? 'pb-3' : ''}>
              <CardTitle className={`flex items-center gap-2 ${isCompact ? 'text-sm' : 'text-base'}`}>
                <FileText className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} />
                Recent Stories
              </CardTitle>
            </CardHeader>
            <CardContent className={isCompact ? 'pt-0' : ''}>
              <TrendingHashtags />
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`space-y-${isCompact ? '3' : '4'}`}>
      {visibleModules.map(renderModule)}
    </div>
  );
}
