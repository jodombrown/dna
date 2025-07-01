
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Globe, 
  Heart, 
  Bookmark, 
  Zap,
  MapPin,
  Calendar,
  X
} from 'lucide-react';
import { CollaborationProject } from '@/types/collaborationTypes';
import { formatFunding, getStatusColor, getStatusDisplayName } from './projectUtils';
import { formatDistanceToNow } from 'date-fns';

interface ProjectDetailDialogProps {
  project: CollaborationProject | null;
  isOpen: boolean;
  onClose: () => void;
  onJoinProject: (projectId: string) => void;
  onLikeProject: (projectId: string) => void;
  onBookmarkProject: (projectId: string) => void;
  likedProjects: Set<string>;
  bookmarkedProjects: Set<string>;
}

const ProjectDetailDialog: React.FC<ProjectDetailDialogProps> = ({
  project,
  isOpen,
  onClose,
  onJoinProject,
  onLikeProject,
  onBookmarkProject,
  likedProjects,
  bookmarkedProjects
}) => {
  if (!project) return null;

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        {/* Header with image and improved close button positioning */}
        <div className="relative">
          {project.image_url && (
            <div className="h-64 overflow-hidden">
              <img 
                src={project.image_url} 
                alt={project.title}
                className="w-full h-full object-cover rounded-t-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 rounded-t-lg" />
            </div>
          )}
          
          {/* Close button - positioned safely away from badges */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 p-0 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg z-50"
          >
            <X className="h-4 w-4 text-gray-700" />
          </Button>

          {/* Status and priority badges - positioned to avoid close button */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <Badge className={getStatusColor(project.status)}>
              {getStatusDisplayName(project.status)}
            </Badge>
            {project.urgency === 'high' && (
              <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                High Priority
              </Badge>
            )}
          </div>

          {/* Quick actions */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-md"
              onClick={() => onLikeProject(project.id)}
            >
              <Heart className={`w-4 h-4 ${likedProjects.has(project.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-md"
              onClick={() => onBookmarkProject(project.id)}
            >
              <Bookmark className={`w-4 h-4 ${bookmarkedProjects.has(project.id) ? 'fill-blue-500 text-blue-500' : 'text-gray-600'}`} />
            </Button>
          </div>
        </div>

        {/* Content area with scroll */}
        <ScrollArea className="max-h-[60vh]">
          <div className="p-6 space-y-6">
            {/* Title and creator */}
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12 ring-2 ring-dna-copper/20">
                <AvatarImage src={project.creator.avatar} />
                <AvatarFallback className="bg-dna-mint text-dna-forest font-semibold">
                  {project.creator.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                    {project.title}
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-gray-600">Created by {project.creator.name}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-lg mb-2">About this Initiative</h3>
              <p className="text-gray-700 leading-relaxed">{project.description}</p>
            </div>

            {/* Individual Country Tags */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Geographic Focus</h4>
              <div className="flex flex-wrap gap-2">
                {project.countries.map((country, index) => (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className={`${getCountryColor(country)} px-3 py-1`}
                  >
                    <MapPin className="w-3 h-3 mr-1" />
                    {country}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Users className="w-6 h-6 text-dna-copper mx-auto mb-2" />
                <div className="font-bold text-lg">{project.collaborators}</div>
                <div className="text-sm text-gray-600">Contributors</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-dna-emerald mx-auto mb-2" />
                <div className="font-bold text-lg">{project.progress}%</div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Clock className="w-6 h-6 text-dna-gold mx-auto mb-2" />
                <div className="font-bold text-sm">{project.time_commitment}</div>
                <div className="text-sm text-gray-600">Commitment</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Globe className="w-6 h-6 text-dna-mint mx-auto mb-2" />
                <div className="font-bold text-lg">{project.countries.length}</div>
                <div className="text-sm text-gray-600">Countries</div>
              </div>
            </div>

            {/* Funding Progress */}
            {project.funding_goal && (
              <div className="bg-gradient-to-r from-dna-mint/10 to-dna-emerald/10 p-6 rounded-lg border border-dna-mint/20">
                <h4 className="font-semibold text-lg mb-4">Funding Progress</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-bold text-dna-forest text-lg">
                      {formatFunding(project.current_funding || 0)} / {formatFunding(project.funding_goal)}
                    </span>
                  </div>
                  <Progress 
                    value={(project.current_funding || 0) / project.funding_goal * 100} 
                    className="h-3"
                  />
                  <p className="text-center text-sm text-gray-600">
                    {Math.round((project.current_funding || 0) / project.funding_goal * 100)}% funded
                  </p>
                </div>
              </div>
            )}

            {/* Skills needed */}
            <div>
              <h4 className="font-semibold text-lg mb-3">Skills Needed</h4>
              <div className="flex flex-wrap gap-2">
                {project.skills_needed.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-dna-copper/10 text-dna-copper px-3 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Recent update */}
            {project.recent_update && (
              <div className="bg-gradient-to-r from-dna-mint/20 to-dna-emerald/20 p-4 rounded-lg border border-dna-mint/30">
                <h4 className="font-semibold text-dna-forest mb-2">Latest Update</h4>
                <p className="text-gray-700 mb-2">{project.recent_update}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer actions */}
        <div className="border-t bg-gray-50 p-6">
          <div className="flex gap-3">
            <Button 
              onClick={() => onJoinProject(project.id)}
              className="flex-1 bg-dna-copper hover:bg-dna-gold text-white font-medium py-3"
            >
              <Zap className="w-4 h-4 mr-2" />
              Join This Initiative
            </Button>
            <Button 
              variant="outline"
              className="flex-1 border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white font-medium py-3"
            >
              Learn More
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailDialog;
