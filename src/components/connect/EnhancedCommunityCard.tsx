
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Users, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
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

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-0 shadow-md relative overflow-hidden h-full">
      {/* Category indicator */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${getCategoryColor(community.category || '')}`} />
      
      {community.is_featured && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-dna-gold text-white shadow-md">
            <TrendingUp className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-dna-forest transition-colors line-clamp-2">
              {community.name}
            </h3>
            
            {community.category && (
              <Badge 
                variant="outline" 
                className="text-xs border-gray-300 text-gray-600 mb-3"
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

        <div className="mt-auto">
          <EnhancedButton
            onClick={onJoin}
            disabled={!isLoggedIn}
            variant="dna"
            className="w-full group/button"
          >
            Join Community
            <ChevronRight className="w-4 h-4 transition-transform group-hover/button:translate-x-1" />
          </EnhancedButton>
          
          {!isLoggedIn && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Sign in to join communities
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedCommunityCard;
