import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MapPin, 
  TrendingUp, 
  ExternalLink,
  Star,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Community {
  id: string;
  name: string;
  description: string;
  member_count: number;
  image_url: string;
  category: string;
  tags: string[];
  is_featured: boolean;
  created_at: string;
}

interface CommunitySpotlightProps {
  maxItems?: number;
  showHeader?: boolean;
  className?: string;
}

const CommunitySpotlight: React.FC<CommunitySpotlightProps> = ({ 
  maxItems = 3, 
  showHeader = true,
  className = "" 
}) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedCommunities();
  }, []);

  const fetchFeaturedCommunities = async () => {
    try {
      // First try to get featured communities
      let { data: featuredData, error: featuredError } = await supabase
        .from('communities')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('member_count', { ascending: false })
        .limit(maxItems);

      if (featuredError) throw featuredError;

      // If we don't have enough featured communities, get the most active ones
      if (!featuredData || featuredData.length < maxItems) {
        const { data: activeData, error: activeError } = await supabase
          .from('communities')
          .select('*')
          .eq('is_active', true)
          .order('member_count', { ascending: false })
          .limit(maxItems);

        if (activeError) throw activeError;

        // Combine and deduplicate
        const allCommunities = [...(featuredData || []), ...(activeData || [])];
        const uniqueCommunities = Array.from(
          new Map(allCommunities.map(c => [c.id, c])).values()
        ).slice(0, maxItems);

        setCommunities(uniqueCommunities as Community[]);
      } else {
        setCommunities(featuredData as Community[]);
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
      // Fallback to mock data for demo
      setCommunities(mockCommunities.slice(0, maxItems));
    } finally {
      setLoading(false);
    }
  };

  // Mock data for fallback
  const mockCommunities: Community[] = [
    {
      id: '1',
      name: 'African Tech Leaders',
      description: 'Connecting technology professionals across the African diaspora to drive innovation and digital transformation.',
      member_count: 1247,
      image_url: '',
      category: 'Technology',
      tags: ['tech', 'innovation', 'leadership'],
      is_featured: true,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Healthcare Heroes',
      description: 'Medical professionals working together to improve healthcare outcomes across Africa.',
      member_count: 892,
      image_url: '',
      category: 'Healthcare',
      tags: ['healthcare', 'medical', 'impact'],
      is_featured: true,
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Entrepreneurs Circle',
      description: 'Building sustainable businesses and creating economic opportunities across African communities.',
      member_count: 2156,
      image_url: '',
      category: 'Business',
      tags: ['entrepreneurship', 'business', 'economy'],
      is_featured: true,
      created_at: new Date().toISOString()
    }
  ];

  const handleJoinCommunity = (communityId: string) => {
    // Navigate to connect page with community focus
    navigate(`/connect?tab=communities&highlight=${communityId}`);
  };

  const getCommunityInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').slice(0, 2);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Technology': 'bg-blue-100 text-blue-800',
      'Healthcare': 'bg-green-100 text-green-800',
      'Business': 'bg-purple-100 text-purple-800',
      'Education': 'bg-yellow-100 text-yellow-800',
      'Arts': 'bg-pink-100 text-pink-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  if (loading) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center text-dna-forest">
              <Star className="h-5 w-5 mr-2" />
              Community Spotlight
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            {[...Array(maxItems)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (communities.length === 0) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center text-dna-forest">
              <Star className="h-5 w-5 mr-2" />
              Community Spotlight
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-6">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              No communities to spotlight yet. Check back soon!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-dna-forest">
              <Star className="h-5 w-5 mr-2" />
              Community Spotlight
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/connect?tab=communities')}
              className="text-dna-emerald hover:text-dna-forest"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
      )}
      
      <CardContent>
        <div className="space-y-4">
          {communities.map((community) => (
            <div 
              key={community.id}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleJoinCommunity(community.id)}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={community.image_url} />
                <AvatarFallback className="bg-dna-emerald text-white font-semibold">
                  {getCommunityInitials(community.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-dna-forest text-sm truncate">
                    {community.name}
                  </h3>
                  {community.is_featured && (
                    <Star className="h-3 w-3 text-dna-gold fill-current ml-2 flex-shrink-0" />
                  )}
                </div>
                
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {community.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {community.member_count?.toLocaleString() || 0}
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Active
                    </div>
                  </div>
                  
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getCategoryColor(community.category)}`}
                  >
                    {community.category}
                  </Badge>
                </div>
                
                {community.tags && community.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {community.tags.slice(0, 2).map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="outline" 
                        className="text-xs px-1.5 py-0.5 text-dna-emerald border-dna-emerald/30"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {community.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5 text-gray-500">
                        +{community.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-dna-emerald border-dna-emerald hover:bg-dna-emerald hover:text-white"
            onClick={() => navigate('/connect?tab=communities')}
          >
            Explore All Communities
            <ExternalLink className="h-3 w-3 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunitySpotlight;