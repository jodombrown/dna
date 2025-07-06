import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Calendar, MessageSquare } from 'lucide-react';

interface DiscoveryCardProps {
  type: 'person' | 'post' | 'hashtag' | 'event';
  data: {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    avatar_url?: string;
    match_reason?: string;
    count?: number;
    growth?: 'up' | 'stable' | 'down';
    engagement_score?: number;
    pillar?: string;
  };
  onAction: (id: string, action: 'follow' | 'view' | 'join') => void;
}

const DiscoveryCard = ({ type, data, onAction }: DiscoveryCardProps) => {
  const getIcon = () => {
    switch (type) {
      case 'person': return <Users className="h-4 w-4" />;
      case 'post': return <MessageSquare className="h-4 w-4" />;
      case 'hashtag': return <TrendingUp className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      default: return null;
    }
  };

  const getActionLabel = () => {
    switch (type) {
      case 'person': return 'Connect';
      case 'post': return 'View';
      case 'hashtag': return 'Explore';
      case 'event': return 'Join';
      default: return 'View';
    }
  };

  const getActionType = (): 'follow' | 'view' | 'join' => {
    switch (type) {
      case 'person': return 'follow';
      case 'event': return 'join';
      default: return 'view';
    }
  };

  const getPillarColor = (pillar?: string) => {
    switch (pillar) {
      case 'connect': return 'text-dna-emerald';
      case 'collaborate': return 'text-dna-copper';
      case 'contribute': return 'text-dna-forest';
      default: return 'text-gray-600';
    }
  };

  const renderPersonCard = () => (
    <div className="flex items-start space-x-3">
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage src={data.avatar_url} />
        <AvatarFallback className="bg-dna-emerald text-white text-sm">
          {data.title.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-gray-900 truncate">{data.title}</h4>
        <p className="text-xs text-gray-500 truncate">{data.subtitle}</p>
        {data.match_reason && (
          <p className="text-xs text-dna-emerald mt-1">{data.match_reason}</p>
        )}
      </div>
    </div>
  );

  const renderPostCard = () => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        {data.pillar && (
          <Badge variant="secondary" className={`text-xs ${getPillarColor(data.pillar)}`}>
            {data.pillar}
          </Badge>
        )}
        {data.engagement_score && data.engagement_score > 0 && (
          <span className="text-xs text-gray-500">
            {data.engagement_score} interactions
          </span>
        )}
      </div>
      <p className="text-sm text-gray-800 line-clamp-3">{data.description}</p>
      {data.match_reason && (
        <p className="text-xs text-dna-emerald">{data.match_reason}</p>
      )}
    </div>
  );

  const renderHashtagCard = () => (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h4 className="font-medium text-sm text-gray-900">#{data.title}</h4>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-xs text-gray-500">{data.count} posts</span>
          {data.growth === 'up' && (
            <TrendingUp className="h-3 w-3 text-green-500" />
          )}
        </div>
      </div>
    </div>
  );

  const renderEventCard = () => (
    <div className="space-y-2">
      <h4 className="font-medium text-sm text-gray-900">{data.title}</h4>
      <p className="text-xs text-gray-500">{data.subtitle}</p>
      <p className="text-xs text-dna-emerald">{data.description}</p>
    </div>
  );

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          {type === 'person' && renderPersonCard()}
          {type === 'post' && renderPostCard()}
          {type === 'hashtag' && renderHashtagCard()}
          {type === 'event' && renderEventCard()}
          
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => onAction(data.id, getActionType())}
          >
            {getIcon()}
            <span className="ml-1">{getActionLabel()}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscoveryCard;