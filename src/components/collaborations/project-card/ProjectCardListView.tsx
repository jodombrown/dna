
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TouchFriendlyButton } from '@/components/ui/mobile-optimized';
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
      <CardContent className="p-3 sm:p-4">
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
                  <h3 className="font-semibold text-sm sm:text-base lg:text-lg text-gray-900 truncate">
                    {project.title}
                  </h3>
                  <Badge className={getStatusColor(project.status)} variant="secondary">
                    {getStatusDisplayName(project.status)}
                  </Badge>
                  {project.urgency === 'high' && (
                    <Badge variant="outline" className={getUrgencyColor(project.urgency)}>
                      {isMobile ? 'High' : 'High Priority'}
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 text-xs text-gray-500 mb-3 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">
                      {project.countries.slice(0, isMobile ? 1 : 2).join(', ')}
                      {project.countries.length > (isMobile ? 1 : 2) && ` +${project.countries.length - (isMobile ? 1 : 2)}`}
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{project.time_commitment}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{project.collaborators} contributors</span>
                  </span>
                </div>
              </div>

              {/* Mobile-optimized action buttons */}
              <div className="flex gap-2 flex-shrink-0">
                {/* Quick actions - always horizontal */}
                <div className="flex gap-1">
                  <TouchFriendlyButton
                    size="sm"
                    variant="outline"
                    onClick={() => onLikeProject(project.id)}
                    className="p-2 min-w-[44px] min-h-[44px]"
                  >
                    <Heart className={`w-4 h-4 ${likedProjects.has(project.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </TouchFriendlyButton>
                  <TouchFriendlyButton
                    size="sm"
                    variant="outline"
                    onClick={() => onBookmarkProject(project.id)}
                    className="p-2 min-w-[44px] min-h-[44px]"
                  >
                    <Bookmark className={`w-4 h-4 ${bookmarkedProjects.has(project.id) ? 'fill-blue-500 text-blue-500' : 'text-gray-400'}`} />
                  </TouchFriendlyButton>
                </div>
                
                {/* Primary actions - stack on mobile, row on desktop */}
                <div className={`flex gap-2 ${isMobile ? 'flex-col' : 'flex-row'}`}>
                  <TouchFriendlyButton
                    size="sm"
                    variant="outline"
                    onClick={onViewDetails}
                    className="border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {isMobile ? 'View' : 'View'}
                  </TouchFriendlyButton>
                  <TouchFriendlyButton
                    size="sm"
                    variant="default"
                    onClick={() => onJoinProject(project.id)}
                    className="bg-dna-copper hover:bg-dna-gold text-white"
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    Join
                  </TouchFriendlyButton>
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
