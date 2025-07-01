
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
  // Get country-specific colors for individual tags
  const getCountryColor = (country: string) => {
    const colors = {
      'Nigeria': 'bg-green-100 text-green-800 border-green-200',
      'Ghana': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Kenya': 'bg-red-100 text-red-800 border-red-200',
      'South Africa': 'bg-blue-100 text-blue-800 border-blue-200',
      'Rwanda': 'bg-purple-100 text-purple-800 border-purple-200',
      'Uganda': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Tanzania': 'bg-pink-100 text-pink-800 border-pink-200',
      'Ethiopia': 'bg-orange-100 text-orange-800 border-orange-200',
      'Morocco': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'Egypt': 'bg-amber-100 text-amber-800 border-amber-200'
    };
    return colors[country as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 group overflow-hidden border-l-4 border-l-dna-copper h-fit max-w-sm mx-auto">
      {/* Header with image - Fixed corner radius */}
      {project.image_url && (
        <div className="relative h-40 overflow-hidden">
          <img 
            src={project.image_url} 
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 rounded-t-lg" />
          
          {/* Status badges - positioned to avoid overlap */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={getStatusColor(project.status)} variant="secondary">
              {getStatusDisplayName(project.status)}
            </Badge>
          </div>
          
          {/* Priority badge - separate positioning */}
          {project.urgency === 'high' && (
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                High Priority
              </Badge>
            </div>
          )}
          
          {/* Quick actions - positioned lower to avoid overlap */}
          <div className="absolute top-12 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-white/95 backdrop-blur-sm text-gray-700 text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {project.timeline}
            </Badge>
          </div>
        </div>
      )}

      <CardContent className="p-5 space-y-4">
        {/* Creator and title */}
        <div className="flex items-start gap-3">
          <Avatar className="w-8 h-8 ring-2 ring-dna-copper/20 flex-shrink-0">
            <AvatarImage src={project.creator.avatar} />
            <AvatarFallback className="bg-dna-mint text-dna-forest font-semibold text-xs">
              {project.creator.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base mb-1 line-clamp-2 group-hover:text-dna-copper transition-colors leading-tight">
              {project.title}
            </h3>
            <p className="text-xs text-gray-600">{project.creator.name}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        {/* Individual Country Tags */}
        <div className="flex flex-wrap gap-1.5">
          {project.countries.slice(0, 3).map((country, index) => (
            <Badge 
              key={index}
              variant="outline" 
              className={`text-xs px-2 py-1 ${getCountryColor(country)}`}
            >
              {country}
            </Badge>
          ))}
          {project.countries.length > 3 && (
            <Badge variant="outline" className="text-xs px-2 py-1 bg-gray-100 text-gray-600 border-gray-200">
              +{project.countries.length - 3} more
            </Badge>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 py-3 border-t border-gray-100">
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

        {/* Time commitment */}
        <div className="flex items-center justify-center border-b border-gray-100 pb-3">
          <Badge variant="outline" className="text-xs bg-dna-mint/10 text-dna-forest border-dna-mint">
            <Clock className="w-3 h-3 mr-1" />
            {project.time_commitment}
          </Badge>
        </div>

        {/* Animated Progress bar for funding */}
        {project.funding_goal && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600">Funding Progress</span>
              <span className="font-semibold text-dna-forest">
                {formatFunding(project.current_funding || 0)} / {formatFunding(project.funding_goal)}
              </span>
            </div>
            <Progress 
              value={(project.current_funding || 0) / project.funding_goal * 100} 
              className="h-2 bg-gray-100"
            />
            <p className="text-xs text-gray-500 text-center">
              {Math.round((project.current_funding || 0) / project.funding_goal * 100)}% funded
            </p>
          </div>
        )}

        {/* Action buttons - Better spacing */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => onJoinProject(project.id)}
            className="flex-1 bg-dna-copper hover:bg-dna-gold text-white h-9 text-sm font-medium"
          >
            <Zap className="w-3 h-3 mr-1" />
            Join Initiative
          </Button>
          <Button 
            onClick={onViewDetails}
            variant="outline"
            className="flex-1 border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white h-9 text-sm font-medium"
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
