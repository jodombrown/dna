
import React from 'react';
import { EnhancedCard, EnhancedCardContent } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CollaborationProject } from '@/types/collaborationTypes';
import { 
  Heart, 
  Bookmark, 
  Users, 
  MapPin, 
  Clock, 
  TrendingUp,
  Eye,
  DollarSign
} from 'lucide-react';

interface EnhancedCompactProjectCardProps {
  project: CollaborationProject;
  viewMode: 'grid' | 'list';
  likedProjects: Set<string>;
  bookmarkedProjects: Set<string>;
  onJoinProject: (projectId: string) => void;
  onLikeProject: (projectId: string) => void;
  onBookmarkProject: (projectId: string) => void;
  onViewDetails: () => void;
}

const EnhancedCompactProjectCard: React.FC<EnhancedCompactProjectCardProps> = ({
  project,
  viewMode,
  likedProjects,
  bookmarkedProjects,
  onJoinProject,
  onLikeProject,
  onBookmarkProject,
  onViewDetails
}) => {
  const isLiked = likedProjects.has(project.id);
  const isBookmarked = bookmarkedProjects.has(project.id);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-dna-emerald text-white';
      case 'planning': return 'bg-dna-copper text-white';
      case 'completed': return 'bg-gray-500 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (viewMode === 'list') {
    return (
      <EnhancedCard hover className="interactive-element">
        <EnhancedCardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Project Image */}
            {project.image_url && (
              <div className="w-full sm:w-32 h-32 flex-shrink-0">
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="profile-image w-full h-full rounded-lg object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-dna-forest mb-2 line-clamp-2">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {project.description}
                  </p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                  <Badge variant="outline" className={`${getUrgencyColor(project.urgency)} tag-hover`}>
                    {project.urgency} priority
                  </Badge>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{project.collaborators} collaborators</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{project.region}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{project.time_commitment}</span>
                </div>
                {project.funding_goal && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span>${project.funding_goal.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-500">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <EnhancedButton
                    size="sm"
                    onClick={() => onJoinProject(project.id)}
                    className="focus-dna"
                  >
                    Join Initiative
                  </EnhancedButton>
                  <EnhancedButton
                    variant="outline"
                    size="sm"
                    onClick={onViewDetails}
                    className="focus-dna"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Details
                  </EnhancedButton>
                </div>

                <div className="flex gap-1">
                  <EnhancedButton
                    variant="ghost"
                    size="sm"
                    onClick={() => onLikeProject(project.id)}
                    className={`p-2 focus-dna ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500'}`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  </EnhancedButton>
                  <EnhancedButton
                    variant="ghost"
                    size="sm"
                    onClick={() => onBookmarkProject(project.id)}
                    className={`p-2 focus-dna ${isBookmarked ? 'text-dna-copper hover:text-dna-gold' : 'text-gray-500 hover:text-dna-copper'}`}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  </EnhancedButton>
                </div>
              </div>
            </div>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>
    );
  }

  // Grid view
  return (
    <EnhancedCard hover interactive className="card-hover group">
      <div className="relative">
        {project.image_url && (
          <div className="h-48 overflow-hidden rounded-t-lg">
            <img
              src={project.image_url}
              alt={project.title}
              className="profile-image-lg w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        
        {/* Status and Priority Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className={getStatusColor(project.status)}>
            {project.status}
          </Badge>
        </div>
        
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className={`${getUrgencyColor(project.urgency)} tag-hover`}>
            {project.urgency}
          </Badge>
        </div>

        {/* Quick Actions */}
        <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <EnhancedButton
            variant="ghost"
            size="sm"
            onClick={() => onLikeProject(project.id)}
            className={`p-2 bg-white/90 backdrop-blur-sm focus-dna ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-700 hover:text-red-500'}`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </EnhancedButton>
          <EnhancedButton
            variant="ghost"
            size="sm"
            onClick={() => onBookmarkProject(project.id)}
            className={`p-2 bg-white/90 backdrop-blur-sm focus-dna ${isBookmarked ? 'text-dna-copper hover:text-dna-gold' : 'text-gray-700 hover:text-dna-copper'}`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </EnhancedButton>
        </div>
      </div>

      <EnhancedCardContent className="p-4">
        <h3 className="font-bold text-lg text-dna-forest mb-2 line-clamp-2 group-hover:text-dna-copper transition-colors">
          {project.title}
        </h3>
        
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {project.description}
        </p>

        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-dna-copper" />
            <span>{project.collaborators}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-dna-emerald" />
            <span className="truncate">{project.region}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-dna-gold" />
            <span className="truncate">{project.time_commitment}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span>{project.progress}%</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <Progress value={project.progress} className="h-2" />
        </div>

        {/* Skills Needed */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {project.skills_needed.slice(0, 3).map((skill, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs bg-dna-mint/20 text-dna-forest border-dna-mint tag-hover"
              >
                {skill}
              </Badge>
            ))}
            {project.skills_needed.length > 3 && (
              <Badge variant="outline" className="text-xs text-gray-500">
                +{project.skills_needed.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <EnhancedButton
            size="sm"
            onClick={() => onJoinProject(project.id)}
            className="flex-1 focus-dna"
          >
            Join Initiative
          </EnhancedButton>
          <EnhancedButton
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            className="focus-dna"
          >
            <Eye className="w-4 h-4" />
          </EnhancedButton>
        </div>
      </EnhancedCardContent>
    </EnhancedCard>
  );
};

export default EnhancedCompactProjectCard;
