import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import UnifiedHeader from '@/components/UnifiedHeader';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  MapPin, 
  Briefcase, 
  Calendar, 
  TrendingUp, 
  Award,
  Users,
  Target,
  Activity
} from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  industry?: string;
  is_public: boolean;
}

interface AdinProfile {
  id: string;
  influence_score: number;
  region_focus: string[] | null;
  sector_focus: string[] | null;
  verified: boolean;
  display_name?: string;
  tags?: any;
  last_updated: string;
}

interface UserContribution {
  id: string;
  type: string;
  target_title?: string;
  created_at: string;
  metadata?: any;
}

interface ImpactLogEntry {
  id: string;
  type: string;
  target_type?: string;
  points: number;
  pillar?: string;
  created_at: string;
  context?: any;
}

const ImpactProfile = () => {
  const { username } = useParams<{ username: string }>();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [adinProfile, setAdinProfile] = useState<AdinProfile | null>(null);
  const [contributions, setContributions] = useState<UserContribution[]>([]);
  const [impactLog, setImpactLog] = useState<ImpactLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!username) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch user profile by username
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .eq('is_public', true)
          .single();

        if (profileError || !profileData) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setProfile(profileData);

        // Fetch ADIN profile
        const { data: adinData, error: adinError } = await supabase
          .from('adin_profiles')
          .select('*')
          .eq('id', profileData.id)
          .single();

        if (!adinError && adinData) {
          setAdinProfile(adinData);
        }

        // Fetch user contributions
        const { data: contributionsData, error: contributionsError } = await supabase
          .from('contributions')
          .select('*')
          .eq('user_id', profileData.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!contributionsError && contributionsData) {
          setContributions(contributionsData);
        }

        // Fetch impact log
        const { data: impactData, error: impactError } = await supabase
          .from('impact_log')
          .select('*')
          .eq('user_id', profileData.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!impactError && impactData) {
          setImpactLog(impactData);
        }

      } catch (error: any) {
        console.error('Error fetching profile data:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [username, toast]);

  const getInfluenceLevel = (score: number) => {
    if (score >= 1000) return { label: 'Expert', color: 'bg-dna-gold text-white' };
    if (score >= 500) return { label: 'Influencer', color: 'bg-dna-copper text-white' };
    if (score >= 200) return { label: 'Contributor', color: 'bg-dna-emerald text-white' };
    if (score >= 50) return { label: 'Engaged', color: 'bg-dna-mint text-dna-forest' };
    return { label: 'Starting', color: 'bg-gray-200 text-gray-700' };
  };

  const formatContributionType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getPillarColor = (pillar: string) => {
    switch (pillar) {
      case 'connect': return 'bg-dna-emerald text-white';
      case 'collaborate': return 'bg-dna-copper text-white';
      case 'contribute': return 'bg-dna-gold text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UnifiedHeader />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-24 h-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return <Navigate to="/404" replace />;
  }

  const influenceLevel = adinProfile ? getInfluenceLevel(adinProfile.influence_score || 0) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedHeader />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                <AvatarFallback className="text-2xl bg-dna-mint text-dna-forest">
                  {profile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <h1 className="text-3xl font-bold text-dna-forest">
                    {profile.full_name}
                  </h1>
                  {adinProfile?.verified && (
                    <CheckCircle className="w-6 h-6 text-dna-emerald" />
                  )}
                </div>
                
                <p className="text-gray-600">@{profile.username}</p>
                
                {profile.bio && (
                  <p className="text-gray-700 max-w-2xl">{profile.bio}</p>
                )}
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  {profile.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.industry && (
                    <div className="flex items-center space-x-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{profile.industry}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Influence Score Display */}
        {adinProfile && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-dna-emerald" />
                <span>Impact Level</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-dna-forest">
                    {adinProfile.influence_score || 0}
                  </div>
                  <p className="text-gray-600">Influence Points</p>
                </div>
                {influenceLevel && (
                  <Badge className={`px-4 py-2 text-sm font-semibold ${influenceLevel.color}`}>
                    {influenceLevel.label}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Focus Areas */}
        {adinProfile && (adinProfile.region_focus || adinProfile.sector_focus) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-dna-emerald" />
                <span>Focus Areas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adinProfile.region_focus && adinProfile.region_focus.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Regional Focus</h4>
                    <div className="flex flex-wrap gap-2">
                      {adinProfile.region_focus.map((region, index) => (
                        <Badge key={index} variant="outline" className="border-dna-emerald text-dna-forest">
                          {region}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {adinProfile.sector_focus && adinProfile.sector_focus.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Sector Focus</h4>
                    <div className="flex flex-wrap gap-2">
                      {adinProfile.sector_focus.map((sector, index) => (
                        <Badge key={index} variant="outline" className="border-dna-copper text-dna-forest">
                          {sector}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Contributions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-dna-emerald" />
              <span>Recent Contributions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contributions.length > 0 ? (
              <div className="space-y-3">
                {contributions.map((contribution) => (
                  <div key={contribution.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-dna-forest">
                        {formatContributionType(contribution.type)}
                      </p>
                      {contribution.target_title && (
                        <p className="text-sm text-gray-600">{contribution.target_title}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(contribution.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No contributions yet</p>
            )}
          </CardContent>
        </Card>

        {/* Impact Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-dna-emerald" />
              <span>Recent Impact Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {impactLog.length > 0 ? (
              <div className="space-y-3">
                {impactLog.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="w-4 h-4 text-dna-emerald" />
                      <div>
                        <p className="font-medium text-dna-forest">
                          {formatContributionType(entry.type)}
                          {entry.target_type && ` - ${formatContributionType(entry.target_type)}`}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-dna-emerald">
                            +{entry.points} points
                          </span>
                          {entry.pillar && (
                            <Badge className={`text-xs ${getPillarColor(entry.pillar)}`}>
                              {entry.pillar}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default ImpactProfile;