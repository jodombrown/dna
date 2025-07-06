import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Building, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface SpotlightProfile {
  id: string;
  display_name: string;
  headline: string;
  location: string;
  company: string;
  avatar_url: string;
  impact_areas: string[];
}

interface SpotlightProject {
  id: string;
  title: string;
  description: string;
  impact_area: string;
  creator_id: string;
}

const CommunitySpotlight = () => {
  const [profiles, setProfiles] = useState<SpotlightProfile[]>([]);
  const [projects, setProjects] = useState<SpotlightProject[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSpotlightData = async () => {
      try {
        // Fetch featured profiles
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, display_name, headline, location, company, avatar_url, impact_areas')
          .eq('is_public', true)
          .not('headline', 'is', null)
          .limit(5);

        // Fetch active projects
        const { data: projectData } = await supabase
          .from('projects')
          .select('id, title, description, impact_area, creator_id')
          .eq('status', 'active')
          .limit(3);

        setProfiles(profileData || []);
        setProjects(projectData || []);
      } catch (error) {
        console.error('Error fetching spotlight data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpotlightData();
  }, []);

  useEffect(() => {
    if (profiles.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % profiles.length);
      }, 5000); // Rotate every 5 seconds

      return () => clearInterval(interval);
    }
  }, [profiles.length]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Community Spotlight
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <div className="space-y-4">
      {/* Profile Spotlight */}
      {currentProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-dna-gold" />
              Community Spotlight
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={currentProfile.avatar_url} />
                <AvatarFallback>
                  {currentProfile.display_name?.split(' ').map(n => n[0]).join('') || '??'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{currentProfile.display_name}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">{currentProfile.headline}</p>
                <div className="flex items-center gap-2 mt-1">
                  {currentProfile.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {currentProfile.location}
                    </div>
                  )}
                  {currentProfile.company && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building className="h-3 w-3" />
                      {currentProfile.company}
                    </div>
                  )}
                </div>
                {currentProfile.impact_areas && currentProfile.impact_areas.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {currentProfile.impact_areas.slice(0, 2).map((area) => (
                      <Badge key={area} variant="secondary" className="text-xs px-2 py-0">
                        {area}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/profile')}
              className="w-full"
            >
              View Profile
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
            
            {/* Rotation indicator */}
            {profiles.length > 1 && (
              <div className="flex justify-center gap-1">
                {profiles.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 w-6 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-dna-emerald' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Featured Projects */}
      {projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Featured Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {projects.slice(0, 2).map((project) => (
              <div key={project.id} className="space-y-2">
                <h5 className="font-medium text-sm line-clamp-1">{project.title}</h5>
                <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
                <div className="flex items-center justify-between">
                  {project.impact_area && (
                    <Badge variant="outline" className="text-xs">{project.impact_area}</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/explore/projects')}
                    className="text-xs h-auto p-1"
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/explore/projects')}
              className="w-full mt-2"
            >
              Explore All Projects
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CommunitySpotlight;