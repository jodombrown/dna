
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TouchFriendlyButton } from '@/components/ui/mobile-optimized';
import { Users, TrendingUp, Calendar, ChevronRight, MessageSquare, Bell } from 'lucide-react';
import { Community } from '@/types/search';

interface EnhancedCommunityCardProps {
  community: Community;
  onJoin: () => void;
  isLoggedIn: boolean;
}

const EnhancedCommunityCard: React.FC<EnhancedCommunityCardProps> = ({
  community,
  onJoin,
  isLoggedIn
}) => {
  const formatMemberCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Technology': 'bg-blue-500',
      'Business': 'bg-emerald-500',
      'Healthcare': 'bg-red-500',
      'Energy': 'bg-yellow-500',
      'Creative': 'bg-purple-500',
      'Agriculture': 'bg-green-500',
      'Finance': 'bg-indigo-500'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  const getCommunityImage = (name: string) => {
    const images = [
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=300&h=200&fit=crop'
    ];
    const index = name.length % images.length;
    return images[index];
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-0 shadow-md relative overflow-hidden h-full animate-fade-in">
      {/* Category indicator */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${getCategoryColor(community.category || '')}`} />
      
      {/* Community image */}
      <div className="relative h-32 overflow-hidden">
        <img
          src={getCommunityImage(community.name)}
          alt={community.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {community.is_featured && (
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-dna-gold hover:bg-dna-copper text-white shadow-md transition-colors">
              <TrendingUp className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-dna-forest transition-colors line-clamp-2">
              {community.name}
            </h3>
            
            {community.category && (
              <Badge 
                variant="outline" 
                className="text-xs border-gray-300 text-gray-600 hover:bg-dna-mint hover:text-dna-forest hover:border-dna-mint transition-all mb-3"
              >
                {community.category}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex flex-col justify-between h-full">
        <div>
          <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3 group-hover:text-gray-800 transition-colors">
            {community.description}
          </p>

          <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1 text-dna-emerald" />
              <span className="font-semibold">{formatMemberCount(community.member_count || 0)}</span>
              <span className="ml-1">members</span>
            </div>
            
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1 text-dna-copper" />
              <span>Active</span>
            </div>
          </div>
        </div>

        <div className="mt-auto space-y-3">
          {/* Primary CTA */}
          <TouchFriendlyButton
            onClick={onJoin}
            disabled={!isLoggedIn}
            variant="default"
            className="w-full bg-dna-emerald hover:bg-dna-forest text-white group/button border-0"
          >
            Join Community
            <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover/button:translate-x-1" />
          </TouchFriendlyButton>
          
          {/* Secondary CTAs */}
          <div className="flex gap-2">
            <TouchFriendlyButton
              variant="outline"
              size="sm"
              className="flex-1 border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white transition-all"
              disabled={!isLoggedIn}
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Discussions
            </TouchFriendlyButton>
            <TouchFriendlyButton
              variant="outline"
              size="sm"
              className="flex-1 border-dna-gold text-dna-gold hover:bg-dna-gold hover:text-white transition-all"
              disabled={!isLoggedIn}
            >
              <Bell className="w-4 h-4 mr-1" />
              Follow
            </TouchFriendlyButton>
          </div>
          
          {!isLoggedIn && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Sign in to join communities, participate in discussions, and receive updates
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedCommunityCard;
