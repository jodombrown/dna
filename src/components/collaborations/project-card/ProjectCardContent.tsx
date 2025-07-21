
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar } from 'lucide-react';
import { CollaborationProject } from '@/types/collaborationTypes';
import { formatDistanceToNow } from 'date-fns';
import { formatFunding } from '../projectUtils';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';

interface ProjectCardContentProps {
  project: CollaborationProject;
}

const ProjectCardContent: React.FC<ProjectCardContentProps> = ({ project }) => {
  const currentFunding = project.current_funding || 0;
  const fundingGoal = project.funding_goal || 0;
  const progressPercentage = fundingGoal > 0 ? (currentFunding / fundingGoal) * 100 : 0;
  
  const { count: animatedCurrentFunding, countRef: fundingRef } = useAnimatedCounter({ 
    end: currentFunding, 
    duration: 2000 
  });
  
  const { count: animatedProgress } = useAnimatedCounter({ 
    end: progressPercentage, 
    duration: 2000,
    decimals: 1 
  });

  return (
    <CardContent className="space-y-4">
      {/* Progress and Funding */}
      {project.funding_goal && (
        <div className="space-y-2" ref={fundingRef}>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Funding Progress</span>
            <span className="font-semibold text-dna-forest">
              {formatFunding(animatedCurrentFunding)} / {formatFunding(project.funding_goal)}
            </span>
          </div>
          <Progress 
            value={animatedProgress} 
            className="h-2"
          />
        </div>
      )}

      {/* Skills Needed */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Skills Needed:</p>
        <div className="flex flex-wrap gap-1">
          {project.skills_needed.slice(0, 4).map((skill, index) => (
            <Badge key={index} variant="secondary" className="text-xs bg-dna-copper/10 text-dna-copper">
              {skill}
            </Badge>
          ))}
          {project.skills_needed.length > 4 && (
            <Badge variant="secondary" className="text-xs">
              +{project.skills_needed.length - 4} more
            </Badge>
          )}
        </div>
      </div>

      {/* Recent Update */}
      {project.recent_update && (
        <div className="bg-gradient-to-r from-dna-mint/20 to-dna-emerald/20 p-4 rounded-lg border border-dna-mint/30">
          <p className="text-xs font-semibold text-dna-forest mb-1">Latest Update</p>
          <p className="text-sm text-gray-700">{project.recent_update}</p>
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
          </p>
        </div>
      )}
    </CardContent>
  );
};

export default ProjectCardContent;
