
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Clock, 
  TrendingUp,
  Heart,
  AlertCircle,
  Calendar,
  Bookmark,
  Zap,
  Globe,
  Eye
} from 'lucide-react';
import { CollaborationProject } from '@/types/collaborationTypes';
import { formatDistanceToNow } from 'date-fns';
import { getUrgencyColor, getStatusColor, formatFunding } from './projectUtils';

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
      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-dna-copper">
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Image */}
            <div className="w-32 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {project.image_url ? (
                <img 
                  src={project.image_url} 
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-dna-copper/20 to-dna-emerald/20 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-dna-copper" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {project.description}
                  </p>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Badge className={getStatusColor(project.status)} variant="secondary">
                    {project.status}
                  </Badge>
                  <Badge variant="outline" className={getUrgencyColor(project.urgency)}>
                    {project.urgency === 'high' && <AlertCircle className="w-3 h-3 mr-1" />}
                    {project.urgency}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <span>{project.countries.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{project.collaborators} contributors</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{project.progress}% complete</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onLikeProject(project.id)}
                    className="p-2"
                  >
                    <Heart className={`w-4 h-4 ${likedProjects.has(project.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onBookmarkProject(project.id)}
                    className="p-2"
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

  // Grid view
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-l-4 border-l-dna-copper group h-fit">
      <div className="relative">
        <div className="h-48 overflow-hidden bg-gray-100">
          {project.image_url ? (
            <img 
              src={project.image_url} 
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-dna-copper/20 to-dna-emerald/20 flex items-center justify-center">
              <Zap className="w-12 h-12 text-dna-copper" />
            </div>
          )}
        </div>
        
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge className={getStatusColor(project.status)} variant="secondary">
            {project.status}
          </Badge>
          <Badge variant="outline" className={getUrgencyColor(project.urgency)}>
            {project.urgency === 'high' && <AlertCircle className="w-3 h-3 mr-1" />}
            {project.urgency}
          </Badge>
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/90 backdrop-blur-sm p-2"
            onClick={() => onLikeProject(project.id)}
          >
            <Heart className={`w-4 h-4 ${likedProjects.has(project.id) ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/90 backdrop-blur-sm p-2"
            onClick={() => onBookmarkProject(project.id)}
          >
            <Bookmark className={`w-4 h-4 ${bookmarkedProjects.has(project.id) ? 'fill-blue-500 text-blue-500' : ''}`} />
          </Button>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-dna-copper transition-colors">
            {project.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-3 mb-3">
            {project.description}
          </p>
          
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-xs bg-dna-mint text-dna-forest">
              <Globe className="w-3 h-3 mr-1" />
              {project.countries.join(', ')}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {project.time_commitment}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        {project.funding_goal && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold text-dna-forest">
                {formatFunding(project.current_funding || 0)} / {formatFunding(project.funding_goal)}
              </span>
            </div>
            <Progress 
              value={(project.current_funding || 0) / project.funding_goal * 100} 
              className="h-2"
            />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 py-3 border-t border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-dna-copper mr-1" />
              <span className="font-bold text-sm">{project.collaborators}</span>
            </div>
            <span className="text-xs text-gray-500">Contributors</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-4 h-4 text-dna-emerald mr-1" />
              <span className="font-bold text-sm">{project.progress}%</span>
            </div>
            <span className="text-xs text-gray-500">Complete</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="w-4 h-4 text-dna-gold mr-1" />
              <span className="font-bold text-xs">{project.timeline}</span>
            </div>
            <span className="text-xs text-gray-500">Timeline</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={onViewDetails}
            variant="outline"
            size="sm"
            className="flex-1 border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white"
          >
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </Button>
          <Button 
            onClick={() => onJoinProject(project.id)}
            size="sm"
            className="flex-1 bg-dna-copper hover:bg-dna-gold text-white"
          >
            <Zap className="w-4 h-4 mr-1" />
            Join Initiative
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactProjectCard;
