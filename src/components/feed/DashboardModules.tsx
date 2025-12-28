import { DashboardModule } from '@/hooks/useDashboardPreferences';
import { ResumeModule } from './ResumeModule';
import { WhatsNextModule } from './WhatsNextModule';
import { TrendingHashtags } from './TrendingHashtags';
import { DiaPanel } from '@/components/dia';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, HandHeart, UserPlus, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLiveEvents } from '@/hooks/useLiveEvents';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useModulePolicy, usePolicyConfig } from '@/hooks/useAdaptiveConfig';
import { useViewState } from '@/contexts/ViewStateContext';
import { getViewStateModulePreset } from '@/config/viewStateModules';

interface ModulesConfig {
  modules: {
    id: string;
    order: number;
    visible: boolean;
  }[];
}

interface ModulesProps {
  visibleModules?: DashboardModule[];
  collapsedModules?: DashboardModule[];
  density?: 'standard' | 'compact';
}

// Extracted module components
function UpcomingEventsModule({ isCompact, navigate, events, error }: any) {
  // TRUST-FIRST: Silent failure - don't show red banner if events fail
  if (error) {
    return (
      <Card>
        <CardHeader className={isCompact ? 'pb-3' : ''}>
          <CardTitle className={`flex items-center gap-2 ${isCompact ? 'text-sm' : 'text-base'}`}>
            <Calendar className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className={isCompact ? 'pt-0' : ''}>
          <p className="text-sm text-muted-foreground">No upcoming events yet.</p>
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3"
            onClick={() => navigate('/dna/convene')}
          >
            Browse Events
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className={isCompact ? 'pb-3' : ''}>
        <CardTitle className={`flex items-center gap-2 ${isCompact ? 'text-sm' : 'text-base'}`}>
          <Calendar className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent className={isCompact ? 'pt-0' : ''}>
        {events && events.length > 0 ? (
          <div className="space-y-2">
            {events.map((event: any) => (
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
          <p className="text-sm text-muted-foreground">No upcoming events yet.</p>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3"
          onClick={() => navigate('/dna/convene')}
        >
          Browse Events
        </Button>
      </CardContent>
    </Card>
  );
}

function RecommendedSpacesModule({ isCompact, navigate, spaces }: any) {
  return (
    <Card>
      <CardHeader className={isCompact ? 'pb-3' : ''}>
        <CardTitle className={`flex items-center gap-2 ${isCompact ? 'text-sm' : 'text-base'}`}>
          <Users className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} />
          Recommended Spaces
        </CardTitle>
      </CardHeader>
      <CardContent className={isCompact ? 'pt-0' : ''}>
        {spaces && spaces.length > 0 ? (
          <div className="space-y-2">
            {spaces.map((space: any) => (
              <div
                key={space.id}
                className="text-sm cursor-pointer hover:text-primary transition-colors"
                onClick={() => navigate(`/dna/collaborate/spaces/${space.id}`)}
              >
                <p className="font-medium truncate">{space.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {space.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No spaces to show</p>
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
}

function OpenNeedsModule({ isCompact, navigate, needs }: any) {
  return (
    <Card>
      <CardHeader className={isCompact ? 'pb-3' : ''}>
        <CardTitle className={`flex items-center gap-2 ${isCompact ? 'text-sm' : 'text-base'}`}>
          <HandHeart className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} />
          Ways to Contribute
        </CardTitle>
      </CardHeader>
      <CardContent className={isCompact ? 'pt-0' : ''}>
        {needs && needs.length > 0 ? (
          <div className="space-y-2">
            {needs.map((need: any) => (
              <div
                key={need.id}
                className="text-sm cursor-pointer hover:text-primary transition-colors"
                onClick={() => navigate(`/dna/contribute/needs/${need.id}`)}
              >
                <p className="font-medium truncate">{need.title}</p>
                <p className="text-xs text-muted-foreground">
                  {need.spaces?.title || 'Project'}
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
}

function SuggestedPeopleModule({ isCompact, navigate, people }: any) {
  return (
    <Card>
      <CardHeader className={isCompact ? 'pb-3' : ''}>
        <CardTitle className={`flex items-center gap-2 ${isCompact ? 'text-sm' : 'text-base'}`}>
          <UserPlus className={isCompact ? 'h-4 w-4' : 'h-5 w-5'} />
          People to Connect With
        </CardTitle>
      </CardHeader>
      <CardContent className={isCompact ? 'pt-0' : ''}>
        {people && people.length > 0 ? (
          <div className="space-y-2">
            {people.map((person: any) => (
              <div
                key={person.id}
                className="text-sm cursor-pointer hover:text-primary transition-colors"
                onClick={() => navigate(`/dna/${person.username || person.id}`)}
              >
                <p className="font-medium truncate">
                  {person.display_name || person.username}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {person.bio || 'DNA Network member'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No suggestions available</p>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3"
          onClick={() => navigate('/dna/connect')}
        >
          Discover More
        </Button>
      </CardContent>
    </Card>
  );
}

// Module registry - maps module IDs to components
const MODULE_REGISTRY: Record<string, (props: any) => JSX.Element | null> = {
  dia_intelligence: (props) => <DiaPanel key="dia_intelligence" />,
  resume_section: (props) => <ResumeModule key="resume_section" />,
  upcoming_events: (props) => <UpcomingEventsModule {...props} key="upcoming_events" />,
  whats_next: (props) => <WhatsNextModule key="whats_next" />,
  trending_hashtags: (props) => <TrendingHashtags key="trending_hashtags" />,
  recommended_spaces: (props) => <RecommendedSpacesModule {...props} key="recommended_spaces" />,
  open_needs: (props) => <OpenNeedsModule {...props} key="open_needs" />,
  suggested_people: (props) => <SuggestedPeopleModule {...props} key="suggested_people" />,
};

// Default module configuration (fallback if no policy)
const DEFAULT_MODULES: ModulesConfig = {
  modules: [
    { id: 'dia_intelligence', order: 0, visible: true },
    { id: 'resume_section', order: 1, visible: true },
    { id: 'whats_next', order: 2, visible: true },
    { id: 'upcoming_events', order: 3, visible: true },
    { id: 'trending_hashtags', order: 4, visible: true },
    { id: 'recommended_spaces', order: 5, visible: true },
    { id: 'open_needs', order: 6, visible: true },
    { id: 'suggested_people', order: 7, visible: true },
  ],
};

export function DashboardModules({ 
  visibleModules = [],
  collapsedModules = [], 
  density = 'standard' 
}: ModulesProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { viewState } = useViewState();
  
  // Get adaptive module policy (now ViewState-aware)
  const { data: modulePolicy } = useModulePolicy(viewState);
  
  // Resolution order:
  // 1. Cohort/experiment policy from ADA (if exists)
  // 2. ViewState-specific default
  // 3. Global DEFAULT_MODULES constant
  const viewStatePreset = getViewStateModulePreset(viewState);
  const fallbackConfig = modulePolicy?.policy ? DEFAULT_MODULES : viewStatePreset;
  const modulesConfig = usePolicyConfig<ModulesConfig>(modulePolicy, fallbackConfig);
  
  const { events: upcomingEvents, error: eventsError } = useLiveEvents(3);

  // Determine which modules should load data based on adaptive config
  const shouldLoadSpaces = modulesConfig.modules.some(m => m.id === 'recommended_spaces' && m.visible);
  const shouldLoadNeeds = modulesConfig.modules.some(m => m.id === 'open_needs' && m.visible);
  const shouldLoadPeople = modulesConfig.modules.some(m => m.id === 'suggested_people' && m.visible);

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
    enabled: !!user && shouldLoadSpaces,
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
    enabled: !!user && shouldLoadNeeds,
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
    enabled: !!user && shouldLoadPeople,
  });

  const isCompact = density === 'compact';

  // Get sorted, visible modules from adaptive config
  const visibleModulesFromPolicy = modulesConfig.modules
    .filter(m => m.visible)
    .sort((a, b) => a.order - b.order);

  // Render modules based on adaptive policy
  return (
    <div className="space-y-4">
      {visibleModulesFromPolicy.map((moduleConfig) => {
        const moduleRenderer = MODULE_REGISTRY[moduleConfig.id];
        
        if (!moduleRenderer) {
          console.warn(`Module ${moduleConfig.id} not found in registry`);
          return null;
        }

        // Pass module-specific data
        const moduleProps = {
          isCompact,
          navigate,
          events: upcomingEvents,
          error: eventsError,
          spaces: recommendedSpaces,
          needs: openNeeds,
          people: suggestedPeople,
        };

        return moduleRenderer(moduleProps);
      })}
    </div>
  );
}
