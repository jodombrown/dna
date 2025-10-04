import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, Calendar, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import OpportunityDetailsDialog from './OpportunityDetailsDialog';

interface OpportunityCardProps {
  opportunity: any;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity }) => {
  const [showDetails, setShowDetails] = useState(false);

  const typeColors = {
    investment: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    volunteer: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    partnership: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    donation: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => setShowDetails(true)}>
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <Badge className={typeColors[opportunity.type as keyof typeof typeColors]}>
              {opportunity.type}
            </Badge>
            <Heart className="h-5 w-5 text-muted-foreground hover:text-rose-500 transition-colors" />
          </div>
          
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {opportunity.title}
          </h3>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {opportunity.description}
          </p>

          {opportunity.organization && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={opportunity.organization.logo_url} />
                <AvatarFallback>{opportunity.organization.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{opportunity.organization.name}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {opportunity.skills?.slice(0, 3).map((skill: any) => (
              <Badge key={skill.id} variant="outline" className="text-xs">
                {skill.name}
              </Badge>
            ))}
            {(opportunity.skills?.length || 0) > 3 && (
              <Badge variant="outline" className="text-xs">
                +{opportunity.skills.length - 3} more
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            {opportunity.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {opportunity.location}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDistanceToNow(new Date(opportunity.created_at), { addSuffix: true })}
          </span>
        </CardFooter>
      </Card>

      <OpportunityDetailsDialog
        opportunity={opportunity}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
    </>
  );
};

export default OpportunityCard;
