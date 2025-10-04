import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, ExternalLink } from 'lucide-react';

interface OrganizationCardProps {
  organization: any;
}

const OrganizationCard: React.FC<OrganizationCardProps> = ({ organization }) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <CardHeader className="space-y-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={organization.logo_url} />
            <AvatarFallback className="text-2xl">{organization.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
              {organization.name}
            </h3>
            {organization.type && (
              <Badge variant="secondary" className="mt-1">
                {organization.type}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {organization.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {organization.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {organization.location}
            </span>
          )}
          {organization.website && (
            <a
              href={organization.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
              Website
            </a>
          )}
        </div>

        {organization.impact_areas && organization.impact_areas.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {organization.impact_areas.slice(0, 3).map((area: string) => (
              <Badge key={area} variant="outline" className="text-xs">
                {area}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrganizationCard;
