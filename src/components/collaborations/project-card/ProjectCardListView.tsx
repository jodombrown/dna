
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Clock, 
  Heart, 
  Bookmark, 
  Zap,
  Eye,
  MapPin,
} from 'lucide-react';
import { CollaborationProject } from '@/types/collaborationTypes';
import { getStatusColor, getStatusDisplayName, getUrgencyColor } from '../projectUtils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProjectCardListViewProps {
  project: CollaborationProject;
  likedProjects: Set<string>;
  bookmarkedProjects: Set<string>;
  onJoinProject: (projectId: string) => void;
  onLikeProject: (projectId: string) => void;
  onBookmarkProject: (projectId: string) => void;
  onViewDetails: () => void;
}

const ProjectCardListView: React.FC<ProjectCardListViewProps> = ({
  project,
  likedProjects,
  bookmarkedProjects,
  onJoinProject,
  onLikeProject,
  onBookmarkProject,
  onViewDetails
}) => {
  const isMobile = useIsMobile();

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-dna-copper">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <Avatar className="w-10 h-10 sm:w-12 sm:h-12 ring-2 ring-dna-copper/20 flex-shrink-0">
            <AvatarImage src={project.creator.avatar} />
            <AvatarFallback className="bg-dna-mint text-dna-forest font-semibold text-xs sm:text-sm">
              {project.creator.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">
                    {project.title}
                  </h3>
                  <Badge className={getStatusColor(project.status)} variant="secondary">
                    {getStatusDisplayName(project.status)}
                  </Badge>
                  {project.urgency === 'high' && (
                    <Badge variant="outline" className={getUrgencyColor(project.urgency)}>
                      High Priority
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-500 mb-3 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {project.countries.slice(0, 2).join(', ')}
                    {project.countries.length > 2 && ` +${project.countries.length - 2}`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {project.time_commitment}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {project.collaborators} contributors
                  </span>
                </div>
              </div>

              {/* Mobile: Stack buttons vertically, Desktop: Horizontal */}
              <div className={`flex gap-2 flex-shrink-0 ${isMobile ? 'flex-col w-full sm:w-auto sm:flex-row' : 'flex-row'}`}>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onLikeProject(project.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Heart className={`w-4 h-4 ${likedProjects.has(project.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onBookmarkProject(project.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Bookmark className={`w-4 h-4 ${bookmarkedProjects.has(project.id) ? 'fill-blue-500 text-blue-500' : 'text-gray-400'}`} />
                  </Button>
                </div>
                
                <div className={`flex gap-2 ${isMobile ? 'flex-1' : ''}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onViewDetails}
                    className={`border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white ${isMobile ? 'flex-1' : ''}`}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {isMobile ? 'Learn More' : 'View'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onJoinProject(project.id)}
                    className={`bg-dna-copper hover:bg-dna-gold text-white ${isMobile ? 'flex-1' : ''}`}
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    Join
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCardListView;
