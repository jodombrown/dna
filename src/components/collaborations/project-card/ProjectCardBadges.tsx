
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { getUrgencyColor, getStatusColor, getStatusDisplayName } from '../projectUtils';

interface ProjectCardBadgesProps {
  status: 'idea' | 'discovery' | 'scoping' | 'planning' | 'approved' | 'active' | 'testing' | 'complete' | 'maintenance';
  urgency: 'low' | 'medium' | 'high';
}

const ProjectCardBadges: React.FC<ProjectCardBadgesProps> = ({ status, urgency }) => {
  return (
    <div className="absolute top-4 right-4 flex gap-2">
      <Badge className={getStatusColor(status)}>
        {getStatusDisplayName(status)}
      </Badge>
      <Badge variant="outline" className={getUrgencyColor(urgency)}>
        {urgency === 'high' && <AlertCircle className="w-3 h-3 mr-1" />}
        {urgency} priority
      </Badge>
    </div>
  );
};

export default ProjectCardBadges;
