
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Share2,
  Bookmark,
  ExternalLink,
  Zap,
  Globe
} from 'lucide-react';
import { CollaborationProject } from '@/types/collaborationTypes';
import { formatDistanceToNow } from 'date-fns';
import { getUrgencyColor, getStatusColor, formatFunding } from './projectUtils';

interface ProjectCardProps {
  project: CollaborationProject;
  likedProjects: Set<string>;
  bookmarkedProjects: Set<string>;
  onJoinProject: (projectId: string) => void;
  onLikeProject?: (projectId: string) => void;
  onBookmarkProject?: (projectId: string) => void;
  onShareProject?: (projectId: string) => void;
  onViewDetails: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  likedProjects,
  bookmarkedProjects,
  onJoinProject,
  onLikeProject,
  onBookmarkProject,
  onShareProject,
  onViewDetails
}) => {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-l-4 border-l-dna-copper group">
      <div className="relative">
        {project.image_url && (
          <div className="h-48 overflow-hidden">
            <img 
              src={project.image_url} 
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="absolute top-4 right-4 flex gap-2">
          <Badge className={getStatusColor(project.status)}>
            {project.status}
          </Badge>
          <Badge variant="outline" className={getUrgencyColor(project.urgency)}>
            {project.urgency === 'high' && <AlertCircle className="w-3 h-3 mr-1" />}
            {project.urgency} priority
          </Badge>
        </div>
        
        {/* Quick Actions Overlay */}
        <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onLikeProject && (
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 backdrop-blur-sm"
              onClick={() => onLikeProject(project.id)}
            >
              <Heart className={`w-4 h-4 ${likedProjects.has(project.id) ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          )}
          {onBookmarkProject && (
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 backdrop-blur-sm"
              onClick={() => onBookmarkProject(project.id)}
            >
              <Bookmark className={`w-4 h-4 ${bookmarkedProjects.has(project.id) ? 'fill-blue-500 text-blue-500' : ''}`} />
            </Button>
          )}
          {onShareProject && (
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 backdrop-blur-sm"
              onClick={() => onShareProject(project.id)}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2 group-hover:text-dna-copper transition-colors">
              {project.title}
            </CardTitle>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {project.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className="text-xs bg-dna-mint text-dna-forest">
                <Globe className="w-3 h-3 mr-1" />
                {project.countries.join(', ')}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {project.time_commitment}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize bg-gray-50">
                {project.impact_area.replace('-', ' ')}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-4">
            <Avatar className="w-12 h-12 ring-2 ring-dna-copper/20">
              <AvatarImage src={project.creator.avatar} />
              <AvatarFallback className="bg-dna-mint text-dna-forest font-semibold">
                {project.creator.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="text-right">
              <p className="text-sm font-semibold">{project.creator.name}</p>
              <p className="text-xs text-gray-500">{project.creator.title}</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress and Funding */}
        {project.funding_goal && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Funding Progress</span>
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

        {/* Project Stats */}
        <div className="grid grid-cols-3 gap-4 py-3 border-t border-b border-gray-100">
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
              <Calendar className="w-4 h-4 text-dna-gold mr-1" />
              <span className="font-bold text-sm">{project.timeline}</span>
            </div>
            <span className="text-xs text-gray-500">Timeline</span>
          </div>
        </div>

        {/* Skills Needed */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Skills Needed:</p>
          <div className="flex flex-wrap gap-1">
            {project.skills_needed.slice(0, 4).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs bg-dna-copper/10 text-dna-copper">
                {skill}
              </Badge>
            ))}
            {project.skills_needed.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{project.skills_needed.length - 4} more
              </Badge>
            )}
          </div>
        </div>

        {/* Recent Update */}
        {project.recent_update && (
          <div className="bg-gradient-to-r from-dna-mint/20 to-dna-emerald/20 p-4 rounded-lg border border-dna-mint/30">
            <p className="text-xs font-semibold text-dna-forest mb-1">Latest Update</p>
            <p className="text-sm text-gray-700">{project.recent_update}</p>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button 
            onClick={() => onJoinProject(project.id)}
            className="flex-1 bg-dna-copper hover:bg-dna-gold text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Zap className="w-4 h-4 mr-2" />
            Join Initiative
          </Button>
          <Button 
            onClick={() => onViewDetails(project.id)}
            variant="outline"
            className="flex-1 border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
