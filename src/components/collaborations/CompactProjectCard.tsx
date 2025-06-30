
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
  Eye,
  MapPin
} from 'lucide-react';
import { CollaborationProject } from '@/types/collaborationTypes';
import { formatFunding, getStatusColor, getUrgencyColor } from './projectUtils';

interface CompactProjectCardProps {
  project: CollaborationProject;
  viewMode: 'grid' | 'list';
  likedProjects: Set<string>;
  bookmarkedProjects: Set<string>;
  onJoinProject: (projectId: string) => void;
  onLikeProject: (projectId: string) => void;
  onBookmarkProject: (projectId: string) => void;
  onViewDetails: () => void;
}

const CompactProjectCard: React.FC<CompactProjectCardProps> = ({
  project,
  viewMode,
  likedProjects,
  bookmarkedProjects,
  onJoinProject,
  onLikeProject,
  onBookmarkProject,
  onViewDetails
}) => {
  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-dna-copper">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="w-12 h-12 ring-2 ring-dna-copper/20 flex-shrink-0">
              <AvatarImage src={project.creator.avatar} />
              <AvatarFallback className="bg-dna-mint text-dna-forest font-semibold text-sm">
                {project.creator.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg text-gray-900 truncate">
                      {project.title}
                    </h3>
                    <Badge className={getStatusColor(project.status)} variant="secondary">
                      {project.status}
                    </Badge>
                    <Badge variant="outline" className={getUrgencyColor(project.urgency)}>
                      {project.urgency}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
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

                <div className="flex items-center gap-2 flex-shrink-0">
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onViewDetails}
                    className="border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onJoinProject(project.id)}
                    className="bg-dna-copper hover:bg-dna-gold text-white"
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    Join
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view - more compact design
  return (
    <Card className="hover:shadow-lg transition-all duration-200 group overflow-hidden border-l-4 border-l-dna-copper h-fit">
      {/* Header with image and badges */}
      {project.image_url && (
        <div className="relative h-32 overflow-hidden">
          <img 
            src={project.image_url} 
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <Badge className={getStatusColor(project.status)} variant="secondary">
              {project.status}
            </Badge>
          </div>
          <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="secondary"
              className="h-6 w-6 p-0 bg-white/90 backdrop-blur-sm"
              onClick={() => onLikeProject(project.id)}
            >
              <Heart className={`w-3 h-3 ${likedProjects.has(project.id) ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-6 w-6 p-0 bg-white/90 backdrop-blur-sm"
              onClick={() => onBookmarkProject(project.id)}
            >
              <Bookmark className={`w-3 h-3 ${bookmarkedProjects.has(project.id) ? 'fill-blue-500 text-blue-500' : ''}`} />
            </Button>
          </div>
        </div>
      )}

      <CardHeader className="pb-3 p-4">
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
            <p className="text-xs text-gray-500">{project.creator.name}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-3">
        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {project.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-3 h-3 text-dna-copper mr-1" />
              <span className="font-semibold">{project.collaborators}</span>
            </div>
            <span className="text-gray-500">Contributors</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-3 h-3 text-dna-emerald mr-1" />
              <span className="font-semibold">{project.progress}%</span>
            </div>
            <span className="text-gray-500">Complete</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Badge variant="outline" className={getUrgencyColor(project.urgency)}>
                {project.urgency}
              </Badge>
            </div>
          </div>
        </div>

        {/* Location and time */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Globe className="w-3 h-3" />
            {project.countries.slice(0, 2).join(', ')}
            {project.countries.length > 2 && '...'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {project.time_commitment}
          </span>
        </div>

        {/* Progress bar for funding */}
        {project.funding_goal && (
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600">Funding</span>
              <span className="font-semibold text-dna-forest">
                {formatFunding(project.current_funding || 0)} / {formatFunding(project.funding_goal)}
              </span>
            </div>
            <Progress 
              value={(project.current_funding || 0) / project.funding_goal * 100} 
              className="h-1"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button 
            onClick={onViewDetails}
            variant="outline"
            size="sm"
            className="flex-1 border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white h-8 text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          <Button 
            onClick={() => onJoinProject(project.id)}
            size="sm"
            className="flex-1 bg-dna-copper hover:bg-dna-gold text-white h-8 text-xs"
          >
            <Zap className="w-3 h-3 mr-1" />
            Join
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactProjectCard;
