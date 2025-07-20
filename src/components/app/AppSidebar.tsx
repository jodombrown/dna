import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Handshake, 
  Heart, 
  MapPin,
  Plus,
  Crown,
  TrendingUp,
  Star,
  Calendar,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useVerificationStatus } from '@/hooks/useVerification';
import { supabase } from '@/integrations/supabase/client';
import VerifiedContributorBadge from './VerifiedContributorBadge';
import ContributorVerificationModal from './ContributorVerificationModal';
import { useNavigate } from 'react-router-dom';

const AppSidebar = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { verificationStatus, loading: verificationLoading } = useVerificationStatus();
  const [userStats, setUserStats] = useState({
    posts: 0,
    connections: 0,
    communities: 0,
    impactScore: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user?.id) return;
      
      try {
        setLoadingStats(true);
        
        // Fetch posts count
        const { count: postsCount } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('author_id', user.id);

        // Fetch connections count (accepted contact requests)
        const { count: connectionsCount } = await supabase
          .from('contact_requests')
          .select('*', { count: 'exact', head: true })
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .eq('status', 'accepted');

        // Fetch communities count
        const { count: communitiesCount } = await supabase
          .from('community_memberships')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'approved');

        // Fetch DNA points/impact score
        const { data: dnaPoints } = await supabase
          .from('user_dna_points')
          .select('total_score')
          .eq('user_id', user.id)
          .maybeSingle();

        setUserStats({
          posts: postsCount || 0,
          connections: connectionsCount || 0,
          communities: communitiesCount || 0,
          impactScore: dnaPoints?.total_score || 0
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchUserStats();
  }, [user?.id]);

  return (
    <div className="space-y-4">
      {/* Profile Snapshot */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Avatar className="h-16 w-16 mx-auto mb-4">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-dna-emerald text-white text-lg">
                {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center justify-center gap-2 mb-2">
              <h3 className="font-semibold text-dna-forest">
                {user?.user_metadata?.full_name || 'DNA Member'}
              </h3>
              <VerifiedContributorBadge 
                isVerified={verificationStatus.is_verified}
                impactType={verificationStatus.impact_type}
                size="sm"
              />
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {profile?.bio || "Welcome to your DNA dashboard"}
            </p>
            <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
              <MapPin className="h-4 w-4 mr-1" />
              {profile?.location || 'Location not set'}
            </div>
            
            {/* User Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-dna-forest">
                  {loadingStats ? '...' : userStats.posts}
                </div>
                <div className="text-xs text-gray-500">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-dna-emerald">
                  {loadingStats ? '...' : userStats.connections}
                </div>
                <div className="text-xs text-gray-500">Connections</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-dna-copper">
                  {loadingStats ? '...' : userStats.communities}
                </div>
                <div className="text-xs text-gray-500">Communities</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-dna-gold">
                  {loadingStats ? '...' : userStats.impactScore}
                </div>
                <div className="text-xs text-gray-500">Impact Score</div>
              </div>
            </div>
            
            {/* Verification Action */}
            {!verificationStatus.is_verified && !verificationLoading && (
              <div className="mb-3">
                <ContributorVerificationModal>
                  <Button variant="outline" size="sm" className="w-full mb-2 text-dna-gold border-dna-gold hover:bg-dna-gold hover:text-white">
                    <Crown className="h-4 w-4 mr-2" />
                    Request Verification
                  </Button>
                </ContributorVerificationModal>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate(`/profile/${profile?.username || profile?.id}`)}
              >
                View Profile
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/profile/settings')}
              >
                Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mission Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">DNA Pillars</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-dna-emerald hover:bg-dna-emerald/10"
            onClick={() => navigate('/connect')}
          >
            <Users className="h-4 w-4 mr-3" />
            Connect
            <Badge variant="secondary" className="ml-auto text-xs">
              {userStats.connections}
            </Badge>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-dna-copper hover:bg-dna-copper/10"
            onClick={() => navigate('/collaborate')}
          >
            <Handshake className="h-4 w-4 mr-3" />
            Collaborate
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-dna-forest hover:bg-dna-forest/10"
            onClick={() => navigate('/contribute')}
          >
            <Heart className="h-4 w-4 mr-3" />
            Contribute
          </Button>
        </CardContent>
      </Card>

      {/* My Communities Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Communities
            <Button size="sm" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userStats.communities > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Active in {userStats.communities} communities</span>
                <TrendingUp className="h-4 w-4 text-dna-emerald" />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => navigate('/community')}
              >
                View My Communities
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 text-center py-4">
                Join communities to connect with like-minded professionals
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => navigate('/community')}
              >
                Browse Communities
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="ghost" 
            className="w-full justify-start hover:bg-dna-mint/20"
            onClick={() => navigate('/messaging')}
          >
            <MessageCircle className="h-4 w-4 mr-3" />
            Messages
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start hover:bg-dna-mint/20"
            onClick={() => navigate('/notifications')}
          >
            <Star className="h-4 w-4 mr-3" />
            Notifications
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start hover:bg-dna-mint/20"
            onClick={() => navigate('/connect')}
          >
            <Calendar className="h-4 w-4 mr-3" />
            Events
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppSidebar;