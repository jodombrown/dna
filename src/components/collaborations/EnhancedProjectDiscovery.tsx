
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
  DollarSign
} from 'lucide-react';
import { CollaborationProject } from '@/types/collaborationTypes';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedProjectDiscoveryProps {
  projects: CollaborationProject[];
  onJoinProject: (projectId: string) => void;
  onViewDetails: (projectId: string) => void;
}

const EnhancedProjectDiscovery: React.FC<EnhancedProjectDiscoveryProps> = ({
  projects,
  onJoinProject,
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

  if (projects.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects match your criteria</h3>
          <p className="text-gray-500">Try adjusting your filters to discover more collaboration opportunities.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {projects.map((project) => (
        <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="relative">
            {project.image_url && (
              <div className="h-48 overflow-hidden">
                <img 
                  src={project.image_url} 
                  alt={project.title}
                  className="w-full h-full object-cover"
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
          </div>

          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    {project.countries.join(', ')}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {project.time_commitment}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {project.impact_area.replace('-', ' ')}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={project.creator.avatar} />
                  <AvatarFallback className="bg-dna-mint text-dna-forest">
                    {project.creator.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <p className="text-sm font-medium">{project.creator.name}</p>
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
                  <span className="font-semibold">
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
            <div className="grid grid-cols-3 gap-4 py-3 border-t border-b">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users className="w-4 h-4 text-dna-copper mr-1" />
                  <span className="font-semibold">{project.collaborators}</span>
                </div>
                <span className="text-xs text-gray-500">Collaborators</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="w-4 h-4 text-dna-emerald mr-1" />
                  <span className="font-semibold">{project.progress}%</span>
                </div>
                <span className="text-xs text-gray-500">Progress</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Calendar className="w-4 h-4 text-dna-gold mr-1" />
                  <span className="font-semibold">{project.timeline}</span>
                </div>
                <span className="text-xs text-gray-500">Timeline</span>
              </div>
            </div>

            {/* Skills Needed */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Skills Needed:</p>
              <div className="flex flex-wrap gap-1">
                {project.skills_needed.slice(0, 4).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
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
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs font-medium text-gray-700 mb-1">Recent Update</p>
                <p className="text-sm text-gray-600">{project.recent_update}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button 
                onClick={() => onJoinProject(project.id)}
                className="flex-1 bg-dna-copper hover:bg-dna-gold text-white"
              >
                <Heart className="w-4 h-4 mr-2" />
                Join Initiative
              </Button>
              <Button 
                onClick={() => onViewDetails(project.id)}
                variant="outline"
                className="flex-1"
              >
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EnhancedProjectDiscovery;
