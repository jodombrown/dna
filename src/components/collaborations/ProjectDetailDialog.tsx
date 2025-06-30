import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Clock, 
  TrendingUp,
  Heart,
  AlertCircle,
  Calendar,
  Share2,
  Bookmark,
  Zap,
  Globe,
  Target,
  DollarSign,
  MapPin,
  User,
  Mail,
  ExternalLink
} from 'lucide-react';
import { CollaborationProject } from '@/types/collaborationTypes';
import { formatDistanceToNow } from 'date-fns';
import { getUrgencyColor, getStatusColor, getStatusDisplayName, formatFunding } from './projectUtils';

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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Join "${project.title}" - DNA Initiative`,
        text: `Check out this impactful African initiative: ${project.description}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          {/* Hero Image */}
          <div className="relative h-64 bg-gradient-to-br from-dna-copper/20 to-dna-emerald/20">
            {project.image_url ? (
              <img 
                src={project.image_url} 
                alt={project.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Zap className="w-16 h-16 text-dna-copper" />
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/20" />
            
            {/* Status badges */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Badge className={getStatusColor(project.status)}>
                {getStatusDisplayName(project.status)}
              </Badge>
              <Badge variant="outline" className={`${getUrgencyColor(project.urgency)} bg-white/90`}>
                {project.urgency === 'high' && <AlertCircle className="w-3 h-3 mr-1" />}
                {project.urgency} priority
              </Badge>
            </div>
          </div>

          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold text-gray-900 mb-4">
                {project.title}
              </DialogTitle>
              
              {/* Creator info */}
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-12 h-12 ring-2 ring-dna-copper/20">
                  <AvatarImage src={project.creator.avatar} />
                  <AvatarFallback className="bg-dna-mint text-dna-forest font-semibold">
                    {project.creator.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">{project.creator.name}</p>
                  <p className="text-sm text-gray-600">{project.creator.title}</p>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="w-5 h-5 text-dna-copper mr-1" />
                    <span className="font-bold text-lg">{project.collaborators}</span>
                  </div>
                  <span className="text-xs text-gray-600">Contributors</span>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <TrendingUp className="w-5 h-5 text-dna-emerald mr-1" />
                    <span className="font-bold text-lg">{project.progress}%</span>
                  </div>
                  <span className="text-xs text-gray-600">Complete</span>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Calendar className="w-5 h-5 text-dna-gold mr-1" />
                    <span className="font-bold text-sm">{project.timeline}</span>
                  </div>
                  <span className="text-xs text-gray-600">Timeline</span>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="w-5 h-5 text-gray-600 mr-1" />
                    <span className="font-bold text-sm">{project.time_commitment}</span>
                  </div>
                  <span className="text-xs text-gray-600">Commitment</span>
                </div>
              </div>
            </DialogHeader>

            {/* Action buttons */}
            <div className="flex gap-3 mb-6">
              <Button 
                onClick={() => onJoinProject(project.id)}
                className="flex-1 bg-dna-copper hover:bg-dna-gold text-white shadow-lg"
                size="lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                Join Initiative
              </Button>
              <Button
                variant="outline"
                onClick={() => onLikeProject(project.id)}
                className="px-4"
              >
                <Heart className={`w-5 h-5 ${likedProjects.has(project.id) ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                variant="outline"
                onClick={() => onBookmarkProject(project.id)}
                className="px-4"
              >
                <Bookmark className={`w-5 h-5 ${bookmarkedProjects.has(project.id) ? 'fill-blue-500 text-blue-500' : ''}`} />
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
                className="px-4"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            <Separator className="mb-6" />

            {/* Project Details */}
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-dna-copper" />
                  About This Initiative
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Funding Progress */}
              {project.funding_goal && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-dna-copper" />
                    Funding Progress
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-gray-600">Current Funding</span>
                      <span className="font-semibold text-dna-forest">
                        {formatFunding(project.current_funding || 0)} / {formatFunding(project.funding_goal)}
                      </span>
                    </div>
                    <Progress 
                      value={(project.current_funding || 0) / project.funding_goal * 100} 
                      className="h-3"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {Math.round((project.current_funding || 0) / project.funding_goal * 100)}% funded
                    </p>
                  </div>
                </div>
              )}

              {/* Location & Impact Area */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-dna-copper" />
                    Geographic Focus
                  </h3>
                  <div className="space-y-2">
                    <Badge variant="outline" className="bg-dna-mint text-dna-forest">
                      <Globe className="w-3 h-3 mr-1" />
                      {project.countries.join(', ')}
                    </Badge>
                    <p className="text-sm text-gray-600 capitalize">
                      {project.region.replace('-', ' ')} • {project.impact_area.replace('-', ' ')}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-dna-copper" />
                    How You Can Contribute
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.contribution_types.map((type, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {type.replace('-', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Skills Needed */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Skills & Expertise Needed
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.skills_needed.map((skill, index) => (
                    <Badge key={index} variant="outline" className="bg-dna-copper/10 text-dna-copper">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Recent Update */}
              {project.recent_update && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Latest Update
                  </h3>
                  <div className="bg-gradient-to-r from-dna-mint/20 to-dna-emerald/20 p-4 rounded-lg border border-dna-mint/30">
                    <p className="text-gray-700 mb-2">{project.recent_update}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )}

              {/* Next Milestone */}
              {project.next_milestone && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Next Milestone
                  </h3>
                  <div className="bg-dna-gold/10 p-4 rounded-lg border border-dna-gold/30">
                    <p className="text-gray-700">{project.next_milestone}</p>
                  </div>
                </div>
              )}

              {/* Tags */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Related Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{tag.toLowerCase().replace(' ', '')}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-gradient-to-r from-dna-copper/10 via-dna-emerald/10 to-dna-gold/10 rounded-lg p-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Ready to Make an Impact?
                </h3>
                <p className="text-gray-600 mb-4">
                  Join this initiative and be part of positive change across Africa.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={() => onJoinProject(project.id)}
                    className="bg-dna-copper hover:bg-dna-gold text-white"
                    size="lg"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Join Initiative
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Contact Team
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailDialog;
