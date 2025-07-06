import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, DollarSign, HandHeart, Calendar } from 'lucide-react';
import { Project, ContributionAction } from '@/types/projectTypes';
import { formatDistanceToNow } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  onContribute: (project: Project, action: ContributionAction) => void;
}

const ProjectCard = ({ project, onContribute }: ProjectCardProps) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold leading-tight">{project.title}</h3>
            {project.impact_area && (
              <Badge variant="secondary" className="text-xs">
                {project.impact_area}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {project.description || 'No description available'}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onContribute(project, 'mentor')}
            className="flex items-center gap-1 text-xs"
          >
            <Heart className="h-3 w-3" />
            Mentor
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onContribute(project, 'join')}
            className="flex items-center gap-1 text-xs"
          >
            <Users className="h-3 w-3" />
            Join
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onContribute(project, 'fund')}
            className="flex items-center gap-1 text-xs"
          >
            <DollarSign className="h-3 w-3" />
            Fund
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onContribute(project, 'support')}
            className="flex items-center gap-1 text-xs"
          >
            <HandHeart className="h-3 w-3" />
            Support
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;