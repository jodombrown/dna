
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, Calendar, MessageSquare, FileText, Video } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  phase: string;
  impact_area: string;
  team_size: number;
  skills_needed: string[];
  creator: {
    name: string;
    avatar: string | null;
  };
  collaborators: number;
  countries: number;
  totalFunding: string;
  currentFunding: string;
  progress: number;
  tags: string[];
  timeline: string;
  status: string;
  // Optional properties for compatibility
  stage?: string;
  nextMeeting?: string;
  recentUpdate?: string;
}

interface ProjectCardProps {
  project: Project;
  onJoin?: () => void;
  onDiscussionClick?: () => void;
  onDocumentsClick?: () => void;
  onMeetingClick?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onJoin,
  onDiscussionClick, 
  onDocumentsClick, 
  onMeetingClick 
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-dna-copper/10 to-dna-emerald/10">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg sm:text-xl mb-2">{project.title}</CardTitle>
            <p className="text-sm sm:text-base text-gray-600">{project.description}</p>
          </div>
          <Badge className="bg-dna-emerald text-white">
            {project.phase || project.stage}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {project.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6">
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{project.collaborators} collaborators • {project.countries} countries</span>
            </div>
            {project.nextMeeting && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Next meeting: {project.nextMeeting}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{project.currentFunding} raised</span>
              <span>{project.totalFunding} goal</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Team Size</div>
            <p className="text-sm text-gray-600">{project.team_size} members</p>
            {project.recentUpdate && (
              <>
                <div className="text-sm font-medium text-gray-700">Recent Update</div>
                <p className="text-sm text-gray-600">{project.recentUpdate}</p>
              </>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {onJoin && (
            <Button 
              onClick={onJoin}
              className="bg-dna-copper hover:bg-dna-gold text-white"
            >
              <Users className="w-4 h-4 mr-2" />
              Join Project
            </Button>
          )}
          {onDiscussionClick && (
            <Button 
              onClick={onDiscussionClick}
              className="bg-dna-copper hover:bg-dna-gold text-white"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Join Discussion
            </Button>
          )}
          {onDocumentsClick && (
            <Button 
              onClick={onDocumentsClick}
              variant="outline"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Documents
            </Button>
          )}
          {onMeetingClick && (
            <Button 
              onClick={onMeetingClick}
              variant="outline"
            >
              <Video className="w-4 h-4 mr-2" />
              Meeting Room
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
