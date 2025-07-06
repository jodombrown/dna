
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, MessageSquare, UserPlus, MoreHorizontal, Share, ThumbsUp } from 'lucide-react';
import { MockProfessional } from './ProfessionalsMockData';
import MobileTouchButton from '@/components/ui/mobile-touch-button';
import MobileOptimizedCard from '@/components/ui/mobile-optimized-card';

interface ProfessionalListItemProps {
  professional: MockProfessional;
}

const ProfessionalListItem: React.FC<ProfessionalListItemProps> = ({ professional }) => {
  const getConnectionButton = (status: string | null, professionalName: string) => {
    switch (status) {
      case 'connected':
        return (
          <MobileTouchButton variant="outline" size="sm">
            <MessageSquare className="w-4 h-4 mr-1" />
            Message
          </MobileTouchButton>
        );
      case 'pending':
        return (
          <MobileTouchButton variant="outline" size="sm" disabled>
            Request Sent
          </MobileTouchButton>
        );
      default:
        return (
          <MobileTouchButton size="sm" className="bg-dna-emerald hover:bg-dna-forest text-white">
            <UserPlus className="w-4 h-4 mr-1" />
            Connect
          </MobileTouchButton>
        );
    }
  };

  return (
    <MobileOptimizedCard padding="md" touchOptimized={true}>
      <div className="space-y-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="relative flex-shrink-0">
            <Avatar className="w-12 h-12 sm:w-16 sm:h-16">
              <AvatarImage src={professional.avatar} alt={professional.name} />
              <AvatarFallback className="bg-gradient-to-br from-dna-copper to-dna-emerald text-white text-sm sm:text-base">
                {professional.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {professional.isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate mb-1">
                  {professional.name}
                </h3>
                <p className="text-dna-copper font-medium text-sm sm:text-base truncate">
                  {professional.title}
                </p>
                <p className="text-gray-600 text-xs sm:text-sm truncate">
                  {professional.company}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {getConnectionButton(professional.connectionStatus, professional.name)}
                <MobileTouchButton variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </MobileTouchButton>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center gap-1 flex-shrink-0">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="truncate">{professional.location}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <span className="truncate">Originally from {professional.origin}</span>
              {professional.mutualConnections > 0 && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-dna-emerald truncate">
                    {professional.mutualConnections} mutual connections
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <p className="text-gray-700 text-sm sm:text-base leading-relaxed line-clamp-3">
          {professional.bio}
        </p>
        
        <div>
          <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Key Skills</div>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {professional.skills.slice(0, 4).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {professional.skills.length > 4 && (
              <Badge variant="outline" className="text-xs text-gray-500">
                +{professional.skills.length - 4} more
              </Badge>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs sm:text-sm text-gray-600">Recent Activity:</div>
          <div className="text-xs sm:text-sm font-medium line-clamp-2">
            {professional.recentActivity}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-gray-100">
          <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600">
            <span>{professional.followers.toLocaleString()} followers</span>
            <span>{professional.connections.toLocaleString()} connections</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MobileTouchButton variant="ghost" size="sm" className="text-xs sm:text-sm">
              <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Endorse
            </MobileTouchButton>
            <MobileTouchButton variant="ghost" size="sm" className="text-xs sm:text-sm">
              <Share className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Share
            </MobileTouchButton>
          </div>
        </div>
      </div>
    </MobileOptimizedCard>
  );
};

export default ProfessionalListItem;
