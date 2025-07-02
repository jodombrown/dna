
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { getUrgencyColor, getStatusColor } from '../projectUtils';

interface ProjectCardBadgesProps {
  status: 'active' | 'launching' | 'scaling' | 'completed';
  urgency: 'low' | 'medium' | 'high';
}

const ProjectCardBadges: React.FC<ProjectCardBadgesProps> = ({ status, urgency }) => {
  return (
    <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
      <Badge className={getStatusColor(status)}>
        {status}
      </Badge>
      <Badge variant="outline" className={getUrgencyColor(urgency)}>
        {urgency === 'high' && <AlertCircle className="w-3 h-3 mr-1" />}
        {urgency} priority
      </Badge>
    </div>
  );
};

export default ProjectCardBadges;
