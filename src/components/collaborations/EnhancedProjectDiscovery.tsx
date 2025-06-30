
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MapPin, 
  Clock, 
  Target, 
  TrendingUp,
  Heart,
  AlertCircle,
  Calendar,
  DollarSign,
  Share2,
  Bookmark,
  ExternalLink,
  Zap,
  Globe
} from 'lucide-react';
import { CollaborationProject } from '@/types/collaborationTypes';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedProjectDiscoveryProps {
  projects: CollaborationProject[];
  viewMode?: 'grid' | 'list';
  likedProjects?: Set<string>;
  bookmarkedProjects?: Set<string>;
  onJoinProject: (projectId: string) => void;
  onLikeProject?: (projectId: string) => void;
  onBookmarkProject?: (projectId: string) => void;
  onShareProject?: (projectId: string) => void;
  onViewDetails: (projectId: string) => void;
}

const EnhancedProjectDiscovery: React.FC<EnhancedProjectDiscoveryProps> = ({
  projects,
  viewMode = 'list',
  likedProjects = new Set(),
  bookmarkedProjects = new Set(),
  onJoinProject,
  onLikeProject,
  onBookmarkProject,
  onShareProject,
  onViewDetails
}) => {
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
      case 'launching': return 'bg-dna-copper text-white';
      case 'scaling': return 'bg-dna-gold text-white';
      case 'completed': return 'bg-gray-500 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFunding = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  const ProjectCard = ({ project }: { project: CollaborationProject }) => (
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

  if (projects.length === 0) {
    return (
      <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-white">
        <CardContent>
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No initiatives match your criteria</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Try adjusting your filters to discover more collaboration opportunities, or consider starting your own initiative.
          </p>
          <Button className="bg-dna-copper hover:bg-dna-gold text-white">
            <Zap className="w-4 h-4 mr-2" />
            Start New Initiative
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`gap-6 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'space-y-6'}`}>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};

export default EnhancedProjectDiscovery;
