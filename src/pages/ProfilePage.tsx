import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import UnifiedHeader from '@/components/UnifiedHeader';
import { 
  MapPin, 
  Briefcase, 
  Globe, 
  Linkedin, 
  Github,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  Edit,
  Twitter
} from 'lucide-react';

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Profile not found');
      return data;
    },
  });

  // Fetch skills separately
  const { data: profileSkills } = useQuery({
    queryKey: ['profile-skills', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('profile_skills')
        .select('skill:skills(id, name, category)')
        .eq('profile_id', profile.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });

  // Fetch causes separately
  const { data: profileCauses } = useQuery({
    queryKey: ['profile-causes', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('profile_causes')
        .select('cause:causes(id, name, icon, description)')
        .eq('profile_id', profile.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });

  // Fetch contribution history
  const { data: contributions } = useQuery({
    queryKey: ['contributions', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('opportunity_contributions')
        .select(`
          *,
          opportunity:opportunities(
            id,
            title,
            organization:organizations(name, logo_url)
          )
        `)
        .eq('contributor_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });

  const isOwnProfile = user?.id === profile?.id;

  if (isLoading) {
    return (
      <>
        <UnifiedHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <UnifiedHeader />
        <div className="container max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The profile you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/contribute')}>
            Browse Opportunities
          </Button>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      
      {/* Banner */}
      {profile.banner_url && (
        <div 
          className="h-48 bg-cover bg-center"
          style={{ backgroundImage: `url(${profile.banner_url})` }}
        />
      )}

      <div className="container max-w-4xl mx-auto px-4 pb-16">
        {/* Header Card */}
        <Card className={profile.banner_url ? '-mt-16 relative' : 'mt-8'}>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar */}
              <Avatar className="w-24 h-24 border-4 border-background">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl">
                  {profile.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              {/* Name & Actions */}
              <div className="flex-1">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold">{profile.full_name}</h1>
                      {profile.verified && (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    {profile.headline && (
                      <p className="text-muted-foreground mt-1">{profile.headline}</p>
                    )}
                  </div>

                  {isOwnProfile && (
                    <Button onClick={() => navigate(`/profile/${username}/edit`)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>

                {/* Quick Info */}
                <div className="flex flex-wrap gap-2 sm:gap-4 mt-4 text-sm text-muted-foreground">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </div>
                  )}
                  {profile.profession && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {profile.profession}
                    </div>
                  )}
                  {profile.availability_hours_per_month > 0 && profile.availability_visible && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {profile.availability_hours_per_month} hrs/month available
                    </div>
                  )}
                </div>

                {/* Languages */}
                {profile.languages && profile.languages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {profile.languages.map((lang: string) => (
                      <Badge key={lang} variant="secondary">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Social Links as Icon Buttons */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {profile.website_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={profile.website_url} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 mr-2" />
                        Website
                      </a>
                    </Button>
                  )}
                  {profile.linkedin_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn
                      </a>
                    </Button>
                  )}
                  {profile.github_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4 mr-2" />
                        GitHub
                      </a>
                    </Button>
                  )}
                  {profile.twitter_handle && (
                    <Button variant="outline" size="sm" asChild>
                      <a 
                        href={`https://twitter.com/${profile.twitter_handle.replace('@', '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Twitter className="w-4 h-4 mr-2" />
                        Twitter
                      </a>
                    </Button>
                  )}
                  {profile.email_visible && profile.email && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`mailto:${profile.email}`}>
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Diaspora Story */}
        {profile.diaspora_story && (
          <Card className="mt-6 border-l-4 border-l-primary">
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Diaspora Story
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base leading-relaxed whitespace-pre-wrap">
                {profile.diaspora_story}
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4 border-t text-sm">
                {profile.country_of_origin && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>
                      <span className="text-muted-foreground">From</span>{' '}
                      <span className="font-medium">{profile.country_of_origin}</span>
                    </span>
                  </div>
                )}
                {profile.years_in_diaspora && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      <span className="font-medium">{profile.years_in_diaspora}</span>{' '}
                      <span className="text-muted-foreground">years in diaspora</span>
                    </span>
                  </div>
                )}
                {profile.current_country && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>
                      <span className="text-muted-foreground">Based in</span>{' '}
                      <span className="font-medium">{profile.current_country}</span>
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Professional Background */}
        {(profile.profession || profile.industry_sectors?.length > 0 || profileSkills?.length > 0) && (
          <Card className="mt-6">
            <CardHeader>
              <h2 className="text-xl font-semibold">Professional Background</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.profession && (
                <div>
                  <h3 className="font-medium mb-2">Current Role</h3>
                  <p>{profile.profession}</p>
                  {profile.years_of_experience && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {profile.years_of_experience} years of experience
                    </p>
                  )}
                </div>
              )}

              {profile.industry_sectors && profile.industry_sectors.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Industry Sectors</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.industry_sectors.map((sector: string) => (
                      <Badge key={sector} variant="outline">
                        {sector}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {profileSkills && profileSkills.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Skills & Expertise</h3>
                  <div className="space-y-3">
                    {Object.entries(
                      profileSkills.reduce((acc: any, ps: any) => {
                        const category = ps.skill.category || 'other';
                        if (!acc[category]) acc[category] = [];
                        acc[category].push(ps.skill);
                        return acc;
                      }, {})
                    ).map(([category, skills]: [string, any]) => (
                      <div key={category}>
                        <div className="text-xs text-muted-foreground uppercase mb-2">
                          {category}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill: any) => (
                            <Badge key={skill.id} variant="default">
                              {skill.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Causes Grid with Icons */}
        {profileCauses && profileCauses.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <h2 className="text-xl font-semibold">Impact Areas</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profileCauses.map((pc: any) => (
                  <div 
                    key={pc.cause.id}
                    className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{pc.cause.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{pc.cause.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {pc.cause.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contribution Preferences */}
        {profile.why_contribute && (
          <Card className="mt-6">
            <CardHeader>
              <h2 className="text-xl font-semibold">Why I Contribute</h2>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {profile.why_contribute}
              </p>
              {profile.availability_hours_per_month > 0 && profile.availability_visible && (
                <p className="text-sm text-muted-foreground mt-4">
                  Available for {profile.availability_hours_per_month} hours per month
                  {profile.location_preference && (
                    <>
                      {' • '}
                      {profile.location_preference === 'remote' && 'Remote only'}
                      {profile.location_preference === 'onsite' && 'On-site only'}
                      {profile.location_preference === 'hybrid' && 'Hybrid (remote & on-site)'}
                    </>
                  )}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Contribution History */}
        {contributions && contributions.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Verified Contributions</h2>
                <Badge variant="outline">
                  {contributions.length} contribution{contributions.length !== 1 && 's'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contributions.map((contrib: any) => (
                  <div key={contrib.id} className="flex gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    {contrib.opportunity?.organization?.logo_url && (
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={contrib.opportunity.organization.logo_url} />
                        <AvatarFallback>
                          {contrib.opportunity.organization.name[0]}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium">{contrib.opportunity?.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {contrib.opportunity?.organization?.name}
                      </p>
                      {contrib.description && (
                        <p className="text-sm mt-2">{contrib.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(contrib.started_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </div>
                        {contrib.hours_contributed > 0 && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {contrib.hours_contributed} hours
                          </div>
                        )}
                        {contrib.verified_at && (
                          <div className="flex items-center gap-1 text-primary">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;