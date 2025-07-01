
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Target, Clock, Users, Heart, Share2 } from 'lucide-react';
import { CollaborationProject } from '@/types/collaborationTypes';
import SetReminderButton from '@/components/calendar/SetReminderButton';

interface CompactProjectCardProps {
  project: CollaborationProject;
  onProjectClick: (project: CollaborationProject) => void;
  onSupportClick: (project: CollaborationProject) => void;
}

const CompactProjectCard: React.FC<CompactProjectCardProps> = ({
  project,
  onProjectClick,
  onSupportClick
}) => {
  const getReminderDate = () => {
    // Set reminder for next week for active projects
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + 7);
    return reminderDate;
  };

  const getBadgeColor = (type: string) => {
    const colors = {
      'funding': 'bg-green-100 text-green-800',
      'volunteers': 'bg-blue-100 text-blue-800',
      'partnership': 'bg-purple-100 text-purple-800',
      'mentorship': 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-dna-emerald bg-white"
          onClick={() => onProjectClick(project)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-dna-emerald transition-colors mb-1 line-clamp-1">
              {project.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {project.description}
            </p>
          </div>
          
          {project.urgency === 'high' && (
            <Badge className="bg-red-100 text-red-800 text-xs ml-2">
              Urgent
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-3">
            {project.region && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-20">{project.region}</span>
              </div>
            )}
            
            {project.impact_area && (
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                <span className="truncate max-w-16">{project.impact_area}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{project.collaborators || 0}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {project.contribution_types?.slice(0, 2).map(type => (
              <Badge key={type} className={`${getBadgeColor(type)} text-xs px-2 py-0.5`}>
                {type}
              </Badge>
            ))}
            {(project.contribution_types?.length || 0) > 2 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                +{(project.contribution_types?.length || 0) - 2}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {/* Set Reminder Button */}
            <SetReminderButton
              title={`Follow up: ${project.title}`}
              date={getReminderDate()}
              description={`Remember to check progress on: ${project.description}`}
              type="followup"
              size="sm"
              className="text-xs px-2 py-1"
            />
            
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSupportClick(project);
              }}
              className="bg-dna-emerald hover:bg-dna-forest text-white text-xs px-3 py-1"
            >
              <Heart className="w-3 h-3 mr-1" />
              Support
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactProjectCard;
