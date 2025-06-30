
import React from 'react';
import { Button } from '@/components/ui/button';
import { Zap, ExternalLink } from 'lucide-react';

interface ProjectCardActionsProps {
  projectId: string;
  onJoinProject: (projectId: string) => void;
  onViewDetails: (projectId: string) => void;
}

const ProjectCardActions: React.FC<ProjectCardActionsProps> = ({
  projectId,
  onJoinProject,
  onViewDetails
}) => {
  return (
    <div className="flex gap-3 pt-2">
      <Button 
        onClick={() => onJoinProject(projectId)}
        className="flex-1 bg-dna-copper hover:bg-dna-gold text-white shadow-lg hover:shadow-xl transition-all"
      >
        <Zap className="w-4 h-4 mr-2" />
        Join Initiative
      </Button>
      <Button 
        onClick={() => onViewDetails(projectId)}
        variant="outline"
        className="flex-1 border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white"
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Learn More
      </Button>
    </div>
  );
};

export default ProjectCardActions;
