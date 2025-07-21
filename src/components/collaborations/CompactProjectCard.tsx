
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
  MapPin,
  Info,
  ExternalLink
} from 'lucide-react';
import { CollaborationProject } from '@/types/collaborationTypes';
import { formatFunding, getStatusColor, getUrgencyColor } from './projectUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';

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
  const isMobile = useIsMobile();
  
  // Animation for funding progress
  const currentFunding = project.current_funding || 0;
  const fundingGoal = project.funding_goal || 0;
  const progressPercentage = fundingGoal > 0 ? (currentFunding / fundingGoal) * 100 : 0;
  
  const { count: animatedCurrentFunding, countRef: fundingRef } = useAnimatedCounter({ 
    end: currentFunding, 
    duration: 2000 
  });
  
  const { count: animatedProgress } = useAnimatedCounter({ 
    end: progressPercentage, 
    duration: 2000,
    decimals: 0 
  });

  // Force list view on mobile for better experience
  const effectiveViewMode = isMobile ? 'list' : viewMode;

  if (effectiveViewMode === 'list') {
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
                      {project.status}
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
  }

  // Grid view (desktop only)
  return (
    <Card className="hover:shadow-lg transition-all duration-200 group overflow-hidden border-l-4 border-l-dna-copper h-fit">
      {/* Header with image */}
      {project.image_url && (
        <div className="relative h-40 overflow-hidden">
          <img 
            src={project.image_url} 
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
          
          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
          </div>
          
          {/* Quick actions - bottom right of image */}
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
              onClick={() => onLikeProject(project.id)}
            >
              <Heart className={`w-4 h-4 ${likedProjects.has(project.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
              onClick={() => onBookmarkProject(project.id)}
            >
              <Bookmark className={`w-4 h-4 ${bookmarkedProjects.has(project.id) ? 'fill-blue-500 text-blue-500' : 'text-gray-600'}`} />
            </Button>
          </div>

          {/* Timeline indicator - bottom left */}
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-gray-700">
              <Clock className="w-3 h-3 mr-1" />
              {project.timeline}
            </Badge>
          </div>
        </div>
      )}

      <CardContent className="p-4 space-y-4">
        {/* Creator and title */}
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10 ring-2 ring-dna-copper/20 flex-shrink-0">
            <AvatarImage src={project.creator.avatar} />
            <AvatarFallback className="bg-dna-mint text-dna-forest font-semibold text-sm">
              {project.creator.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-dna-copper transition-colors">
              {project.title}
            </h3>
            <p className="text-sm text-gray-600">{project.creator.name}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 py-3 border-t border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-dna-copper mr-1" />
              <span className="font-bold text-lg">{project.collaborators}</span>
            </div>
            <span className="text-xs text-gray-500">Contributors</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-4 h-4 text-dna-emerald mr-1" />
              <span className="font-bold text-lg">{project.progress}%</span>
            </div>
            <span className="text-xs text-gray-500">Complete</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Globe className="w-4 h-4 text-dna-gold mr-1" />
              <span className="font-bold text-sm">{project.countries.length}</span>
            </div>
            <span className="text-xs text-gray-500">Countries</span>
          </div>
        </div>

        {/* Location and commitment */}
        <div className="flex items-center justify-between text-xs text-gray-500 border-b border-gray-100 pb-3">
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
          <div className="space-y-2" ref={fundingRef}>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600">Funding Progress</span>
              <span className="font-semibold text-dna-forest">
                {formatFunding(animatedCurrentFunding)} / {formatFunding(project.funding_goal)}
              </span>
            </div>
            <Progress 
              value={animatedProgress} 
              className="h-2"
            />
            <p className="text-xs text-gray-500 text-center">
              {Math.round(animatedProgress)}% funded
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => onJoinProject(project.id)}
            className="flex-1 bg-dna-copper hover:bg-dna-gold text-white h-10"
          >
            <Zap className="w-4 h-4 mr-2" />
            Join Initiative
          </Button>
          <Button 
            onClick={onViewDetails}
            variant="outline"
            className="flex-1 border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white h-10"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactProjectCard;
