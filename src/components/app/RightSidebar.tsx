import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDiscovery } from '@/hooks/useDiscovery';
import DiscoveryCard from './DiscoveryCard';
import ReferralCard from '@/components/community/ReferralCard';
import CommunitySpotlight from '@/components/community/CommunitySpotlight';
import AdinSuggestions from './AdinSuggestions';
import ContextualSuggestions from './ContextualSuggestions';
import { useToast } from '@/hooks/use-toast';

const RightSidebar = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentPostContext, setCurrentPostContext] = useState<{
    pillar?: string;
    hashtags?: string[];
    authorId?: string;
  } | undefined>();
  
  const { 
    suggestedPeople, 
    suggestedPosts, 
    trendingHashtags, 
    loading, 
    refreshDiscovery 
  } = useDiscovery(user?.id);

  // This would typically be connected to post viewing events from the center feed
  // For now, we'll simulate context awareness
  React.useEffect(() => {
    // Listen for post context changes (would be implemented via context/state management)
    const handlePostFocus = (event: CustomEvent) => {
      setCurrentPostContext(event.detail);
    };

    window.addEventListener('postFocus', handlePostFocus as EventListener);
    return () => window.removeEventListener('postFocus', handlePostFocus as EventListener);
  }, []);

  const handleDiscoveryAction = async (id: string, action: 'follow' | 'view' | 'join') => {
    // Placeholder for action handlers - would integrate with actual follow/view/join logic
    const actionLabels = {
      follow: 'connect with',
      view: 'view',
      join: 'join'
    };
    
    toast({
      title: "Action Noted",
      description: `Ready to ${actionLabels[action]} this item. Feature coming soon!`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Context-Aware Suggestions - Priority section */}
      {currentPostContext && (
        <ContextualSuggestions currentPostContext={currentPostContext} />
      )}

      {/* ADIN-Powered Suggestions */}
      <AdinSuggestions />

      {/* Community Spotlight */}
      <CommunitySpotlight />

      {/* Referral Card */}
      <ReferralCard />

      {/* Discovery Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-dna-emerald" />
              Discover
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshDiscovery}
              disabled={loading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Suggested People - Enhanced with quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Users className="h-5 w-5 mr-2 text-dna-emerald" />
            People You May Know
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : suggestedPeople.length > 0 ? (
            suggestedPeople.slice(0, 3).map((person) => (
              <div key={person.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <DiscoveryCard
                  type="person"
                  data={{
                    id: person.id,
                    title: person.full_name,
                    subtitle: person.location || 'DNA Community',
                    description: person.bio,
                    avatar_url: person.avatar_url,
                    match_reason: person.match_reason
                  }}
                  onAction={handleDiscoveryAction}
                />
                <div className="flex gap-1 mt-2">
                  <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                    Connect
                  </Button>
                  <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                    Message
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No suggestions available yet
            </p>
          )}
          
          {suggestedPeople.length > 3 && (
            <Button variant="ghost" size="sm" className="w-full text-xs">
              View All ({suggestedPeople.length - 3} more)
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Trending Content - Streamlined */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-dna-emerald" />
            Trending Now
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : trendingHashtags.length > 0 ? (
            trendingHashtags.slice(0, 3).map((hashtag) => (
              <div key={hashtag.tag} className="hover:bg-gray-50 p-2 rounded cursor-pointer">
                <p className="text-sm font-medium">{hashtag.tag}</p>
                <p className="text-xs text-gray-500">{hashtag.count} posts</p>
              </div>
            ))
          ) : (
            <div className="space-y-2">
              <div className="hover:bg-gray-50 p-2 rounded cursor-pointer">
                <p className="text-sm font-medium">#AfricaTech2024</p>
                <p className="text-xs text-gray-500">142 posts</p>
              </div>
              <div className="hover:bg-gray-50 p-2 rounded cursor-pointer">
                <p className="text-sm font-medium">#DiasporaInvestment</p>
                <p className="text-xs text-gray-500">89 posts</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* High-Engagement Posts */}
      {suggestedPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recommended Posts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestedPosts.map((post) => (
              <DiscoveryCard
                key={post.id}
                type="post"
                data={{
                  id: post.id,
                  title: post.author_name || 'DNA Member',
                  description: post.content,
                  pillar: post.pillar,
                  engagement_score: post.engagement_score,
                  match_reason: post.match_reason
                }}
                onAction={handleDiscoveryAction}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Opportunities Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Opportunities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="border-l-4 border-dna-emerald pl-3">
            <p className="text-sm font-medium">AfriTech Conference 2024</p>
            <p className="text-xs text-gray-500">Join 500+ tech leaders</p>
          </div>
          <div className="border-l-4 border-dna-copper pl-3">
            <p className="text-sm font-medium">Diaspora Investment Fund</p>
            <p className="text-xs text-gray-500">Seed funding available</p>
          </div>
          <div className="border-l-4 border-dna-forest pl-3">
            <p className="text-sm font-medium">Education Initiative</p>
            <p className="text-xs text-gray-500">Volunteers needed</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RightSidebar;