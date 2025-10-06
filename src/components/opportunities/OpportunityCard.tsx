import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Bookmark, DollarSign, Users } from 'lucide-react';
import { Opportunity } from '@/types/opportunityTypes';
import { impactAreas } from '@/components/collaborations/filters/filterData';
import { useNavigate } from 'react-router-dom';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onApply?: (id: string) => void;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ 
  opportunity, 
  onApply,
  onBookmark,
  isBookmarked = false,
}) => {
  const navigate = useNavigate();
  
  const getImpactIcon = (area: string) => {
    return impactAreas.find(a => a.value === area)?.icon || '📍';
  };

  return (
    <Card 
      className="hover:shadow-lg transition-all border-dna-emerald/20 hover:border-dna-emerald/40 cursor-pointer"
      onClick={() => navigate(`/opportunities/${opportunity.id}`)}
    >
      <CardContent className="pt-6">
        <div className="flex gap-4">
          {/* Creator Avatar */}
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarImage src={opportunity.creator?.avatar_url} />
            <AvatarFallback className="bg-dna-copper text-white">
              {opportunity.creator?.full_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-dna-forest hover:underline cursor-pointer text-lg">
                  {opportunity.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-muted-foreground">
                    {opportunity.creator?.full_name || 'DNA Member'}
                  </p>
                  {opportunity.creator?.verified && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-dna-emerald/10 text-dna-forest border-dna-emerald">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`hover:bg-dna-emerald/10 ${isBookmarked ? 'text-dna-copper' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmark?.(opportunity.id);
                }}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {opportunity.description || 'No description available'}
            </p>

            {/* Tags */}
            {opportunity.tags && opportunity.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {opportunity.tags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="text-xs border-dna-emerald/30 text-dna-forest bg-dna-emerald/5"
                  >
                    {getImpactIcon(tag)} {impactAreas.find(a => a.value === tag)?.label || tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
              {opportunity.type && (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span className="capitalize">{opportunity.type.replace('-', ' ')}</span>
                </div>
              )}
              {opportunity.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {opportunity.location}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="bg-dna-copper hover:bg-dna-copper/90 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/opportunities/${opportunity.id}`);
                }}
              >
                View Details
              </Button>
            </div>

            {/* Posted Date */}
            <div className="mt-3 text-xs text-muted-foreground">
              Posted {new Date(opportunity.created_at).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OpportunityCard;
