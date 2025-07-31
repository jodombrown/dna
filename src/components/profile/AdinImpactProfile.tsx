import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Award, 
  TrendingUp, 
  MapPin, 
  Briefcase, 
  Star,
  Bell,
  Calendar,
  Target
} from 'lucide-react';
import { useAdinProfile } from '@/hooks/useAdinProfile';
import { Skeleton } from '@/components/ui/skeleton';

interface AdinImpactProfileProps {
  userId?: string;
  showSignals?: boolean;
}

const AdinImpactProfile: React.FC<AdinImpactProfileProps> = ({ 
  userId, 
  showSignals = true 
}) => {
  const {
    adinProfile,
    contributions,
    impactLogs,
    signals,
    isLoading,
    contributionsLoading,
    impactLogsLoading,
    signalsLoading,
    markSignalSeen
  } = useAdinProfile(userId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const influenceScore = adinProfile?.influence_score || 0;
  const isVerified = adinProfile?.verified || false;
  const regionFocus = adinProfile?.region_focus || [];
  const sectorFocus = adinProfile?.sector_focus || [];
  
  // Calculate influence level
  const getInfluenceLevel = (score: number) => {
    if (score >= 1000) return { level: 'Expert', color: 'bg-dna-gold', percentage: 100 };
    if (score >= 500) return { level: 'Influencer', color: 'bg-dna-copper', percentage: 80 };
    if (score >= 200) return { level: 'Contributor', color: 'bg-dna-emerald', percentage: 60 };
    if (score >= 50) return { level: 'Engaged', color: 'bg-dna-mint', percentage: 40 };
    return { level: 'Getting Started', color: 'bg-gray-400', percentage: 20 };
  };

  const influenceLevel = getInfluenceLevel(influenceScore);
  const unseenSignals = signals?.filter(s => !s.seen) || [];

  return (
    <div className="space-y-6">
      {/* Impact Score & Verification */}
      <Card className="border-2 border-dna-emerald/20 hover:border-dna-emerald/40 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-dna-emerald" />
            ADIN Impact Profile
            {isVerified && (
              <Badge variant="secondary" className="bg-dna-gold/10 text-dna-gold border-dna-gold/20">
                <Star className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Influence Score */}
            <div className="text-center">
              <div className="text-3xl font-bold text-dna-forest mb-2">
                {influenceScore.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 mb-2">Influence Points</div>
              <Badge 
                variant="secondary" 
                className={`${influenceLevel.color} text-white`}
              >
                {influenceLevel.level}
              </Badge>
            </div>

            {/* Progress to Next Level */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">
                Progress to {influenceScore >= 1000 ? 'Mastery' : 'Next Level'}
              </div>
              <Progress value={influenceLevel.percentage} className="h-2" />
              <div className="text-xs text-gray-500">
                {influenceScore < 1000 && `${Math.max(0, 1000 - influenceScore)} points to Expert`}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="text-center">
              <div className="text-2xl font-bold text-dna-copper mb-2">
                {impactLogs?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Recent Activities</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Focus Areas */}
      {(regionFocus.length > 0 || sectorFocus.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-dna-copper" />
              Focus Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {regionFocus.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-dna-forest" />
                    <span className="text-sm font-medium">Regional Focus</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {regionFocus.map((region, index) => (
                      <Badge key={index} variant="outline" className="text-dna-forest border-dna-forest/20">
                        {region}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {sectorFocus.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-dna-forest" />
                    <span className="text-sm font-medium">Sector Focus</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sectorFocus.map((sector, index) => (
                      <Badge key={index} variant="outline" className="text-dna-emerald border-dna-emerald/20">
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
      {!contributionsLoading && contributions && contributions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-dna-gold" />
              Recent Contributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contributions.slice(0, 5).map((contribution) => (
                <div key={contribution.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-dna-forest">{contribution.type}</div>
                    <div className="text-sm text-gray-600">{contribution.description}</div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      {contribution.sector && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {contribution.sector}
                        </span>
                      )}
                      {contribution.region && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {contribution.region}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(contribution.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ADIN Signals */}
      {showSignals && !signalsLoading && unseenSignals.length > 0 && (
        <Card className="border-2 border-dna-mint/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-dna-mint" />
              ADIN Recommendations
              <Badge variant="secondary" className="bg-dna-mint/10 text-dna-mint">
                {unseenSignals.length} New
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unseenSignals.slice(0, 3).map((signal) => (
                <div key={signal.id} className="flex items-start gap-3 p-3 bg-dna-mint/5 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-dna-forest capitalize">
                      {signal.signal_type.replace('_', ' ')}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {(signal.signal_data as any)?.description || 'New opportunity matched to your profile'}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => markSignalSeen(signal.id)}
                    >
                      Mark as Seen
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdinImpactProfile;