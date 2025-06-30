
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Globe, Clock } from 'lucide-react';
import { CollaborationProject } from '@/types/collaborationTypes';

interface ProjectCardHeaderProps {
  project: CollaborationProject;
}

const ProjectCardHeader: React.FC<ProjectCardHeaderProps> = ({ project }) => {
  return (
    <CardHeader className="pb-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <CardTitle className="text-xl mb-2 group-hover:text-dna-copper transition-colors">
            {project.title}
          </CardTitle>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {project.description}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="outline" className="text-xs bg-dna-mint text-dna-forest">
              <Globe className="w-3 h-3 mr-1" />
              {project.countries.join(', ')}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {project.time_commitment}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize bg-gray-50">
              {project.impact_area.replace('-', ' ')}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-4">
          <Avatar className="w-12 h-12 ring-2 ring-dna-copper/20">
            <AvatarImage src={project.creator.avatar} />
            <AvatarFallback className="bg-dna-mint text-dna-forest font-semibold">
              {project.creator.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="text-right">
            <p className="text-sm font-semibold">{project.creator.name}</p>
            <p className="text-xs text-gray-500">{project.creator.title}</p>
          </div>
        </div>
      </div>
    </CardHeader>
  );
};

export default ProjectCardHeader;
