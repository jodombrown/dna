
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Clock, 
  MapPin, 
  Target,
  Users,
  Heart,
  TrendingUp
} from 'lucide-react';
import { useContributionCards } from '@/hooks/useContributionCards';
import { formatDistanceToNow } from 'date-fns';

const ContributionCardsGrid: React.FC = () => {
  const { cards, loading } = useContributionCards();

  const getContributionTypeIcon = (type: string) => {
    switch (type) {
      case 'funding':
        return <DollarSign className="w-4 h-4" />;
      case 'skills':
        return <Target className="w-4 h-4" />;
      case 'time':
        return <Clock className="w-4 h-4" />;
      case 'network':
        return <Users className="w-4 h-4" />;
      case 'advocacy':
        return <Heart className="w-4 h-4" />;
      case 'mentorship':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getContributionTypeColor = (type: string) => {
    switch (type) {
      case 'funding':
        return 'bg-green-100 text-green-800';
      case 'skills':
        return 'bg-blue-100 text-blue-800';
      case 'time':
        return 'bg-purple-100 text-purple-800';
      case 'network':
        return 'bg-orange-100 text-orange-800';
      case 'advocacy':
        return 'bg-red-100 text-red-800';
      case 'mentorship':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Active Opportunities</h2>
        <Badge variant="outline" className="text-sm">
          {cards.length} opportunities
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const progressPercentage = card.amount_needed 
            ? (card.amount_raised / card.amount_needed) * 100 
            : 0;

          return (
            <Card key={card.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold mb-2 line-clamp-2">
                      {card.title}
                    </CardTitle>
                    <Badge 
                      className={`flex items-center gap-1 w-fit ${getContributionTypeColor(card.contribution_type)}`}
                    >
                      {getContributionTypeIcon(card.contribution_type)}
                      {card.contribution_type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm line-clamp-3">
                  {card.description}
                </p>

                {card.amount_needed && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold">
                        ${card.amount_raised.toLocaleString()} / ${card.amount_needed.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    <p className="text-xs text-gray-500">
                      {progressPercentage.toFixed(1)}% funded
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  {card.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {card.location}
                    </div>
                  )}
                  {card.impact_area && (
                    <Badge variant="outline" className="text-xs">
                      {card.impact_area}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={card.creator?.avatar_url} />
                      <AvatarFallback className="text-xs bg-dna-mint text-dna-forest">
                        {card.creator?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-gray-600">
                      {card.creator?.full_name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(card.created_at), { addSuffix: true })}
                  </span>
                </div>

                <Button 
                  className="w-full bg-dna-emerald hover:bg-dna-forest text-white"
                  size="sm"
                >
                  Contribute Now
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {cards.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No contribution opportunities yet.</p>
            <p className="text-sm text-gray-400">Be the first to create an opportunity for the community!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContributionCardsGrid;
