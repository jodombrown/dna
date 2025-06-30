import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Globe, 
  Heart, 
  Bookmark, 
  Zap,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { CollaborationProject } from '@/types/collaborationTypes';
import { formatFunding, getStatusColor, getStatusDisplayName } from '../projectUtils';

interface ProjectCardGridViewProps {
  project: CollaborationProject;
  likedProjects: Set<string>;
  bookmarkedProjects: Set<string>;
  onJoinProject: (projectId: string) => void;
  onLikeProject: (projectId: string) => void;
  onBookmarkProject: (projectId: string) => void;
  onViewDetails: () => void;
}

const ProjectCardGridView: React.FC<ProjectCardGridViewProps> = ({
  project,
  likedProjects,
  bookmarkedProjects,
  onJoinProject,
  onLikeProject,
  onBookmarkProject,
  onViewDetails
}) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 group overflow-hidden border-l-4 border-l-dna-copper h-fit">
      {/* Header with image */}
      {project.image_url && (
        <div className="relative h-32 overflow-hidden">
          <img 
            src={project.image_url} 
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
          
          {/* Status badges - moved to left */}
          <div className="absolute top-2 left-2 flex gap-2">
            <Badge className={getStatusColor(project.status)} variant="secondary">
              {getStatusDisplayName(project.status)}
            </Badge>
            {project.urgency === 'high' && (
              <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                High Priority
              </Badge>
            )}
          </div>
          
          {/* Quick actions - moved further right to avoid overlap */}
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="secondary"
              className="h-7 w-7 p-0 bg-white/95 backdrop-blur-sm hover:bg-white shadow-md"
              onClick={() => onLikeProject(project.id)}
            >
              <Heart className={`w-3 h-3 ${likedProjects.has(project.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-7 w-7 p-0 bg-white/95 backdrop-blur-sm hover:bg-white shadow-md"
              onClick={() => onBookmarkProject(project.id)}
            >
              <Bookmark className={`w-3 h-3 ${bookmarkedProjects.has(project.id) ? 'fill-blue-500 text-blue-500' : 'text-gray-600'}`} />
            </Button>
          </div>

          {/* Timeline indicator */}
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="bg-white/95 backdrop-blur-sm text-gray-700 text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {project.timeline}
            </Badge>
          </div>
        </div>
      )}

      <CardContent className="p-4 space-y-3">
        {/* Creator and title */}
        <div className="flex items-start gap-3">
          <Avatar className="w-8 h-8 ring-2 ring-dna-copper/20 flex-shrink-0">
            <AvatarImage src={project.creator.avatar} />
            <AvatarFallback className="bg-dna-mint text-dna-forest font-semibold text-xs">
              {project.creator.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base mb-1 line-clamp-2 group-hover:text-dna-copper transition-colors">
              {project.title}
            </h3>
            <p className="text-xs text-gray-600">{project.creator.name}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 py-2 border-t border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-3 h-3 text-dna-copper mr-1" />
              <span className="font-bold text-sm">{project.collaborators}</span>
            </div>
            <span className="text-xs text-gray-500">Contributors</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-3 h-3 text-dna-emerald mr-1" />
              <span className="font-bold text-sm">{project.progress}%</span>
            </div>
            <span className="text-xs text-gray-500">Complete</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Globe className="w-3 h-3 text-dna-gold mr-1" />
              <span className="font-bold text-sm">{project.countries.length}</span>
            </div>
            <span className="text-xs text-gray-500">Countries</span>
          </div>
        </div>

        {/* Location and commitment */}
        <div className="flex items-center justify-between text-xs text-gray-500 border-b border-gray-100 pb-2">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {project.countries.slice(0, 2).join(', ')}
            {project.countries.length > 2 && '...'}
          </span>
          <Badge variant="outline" className="text-xs">
            {project.time_commitment}
          </Badge>
        </div>

        {/* Progress bar for funding */}
        {project.funding_goal && (
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600">Funding Progress</span>
              <span className="font-semibold text-dna-forest">
                {formatFunding(project.current_funding || 0)} / {formatFunding(project.funding_goal)}
              </span>
            </div>
            <Progress 
              value={(project.current_funding || 0) / project.funding_goal * 100} 
              className="h-1.5"
            />
            <p className="text-xs text-gray-500 text-center">
              {Math.round((project.current_funding || 0) / project.funding_goal * 100)}% funded
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <Button 
            onClick={() => onJoinProject(project.id)}
            className="flex-1 bg-dna-copper hover:bg-dna-gold text-white h-8 text-xs"
          >
            <Zap className="w-3 h-3 mr-1" />
            Join Initiative
          </Button>
          <Button 
            onClick={onViewDetails}
            variant="outline"
            className="flex-1 border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white h-8 text-xs"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCardGridView;
