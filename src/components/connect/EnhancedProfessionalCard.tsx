
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Briefcase, GraduationCap, MessageCircle, UserPlus, ExternalLink, Star } from 'lucide-react';
import { Professional } from '@/types/search';

interface EnhancedProfessionalCardProps {
  professional: Professional;
  onConnect: () => void;
  onMessage: () => void;
  connectionStatus: any;
  isLoggedIn: boolean;
}

const EnhancedProfessionalCard: React.FC<EnhancedProfessionalCardProps> = ({
  professional,
  onConnect,
  onMessage,
  connectionStatus,
  isLoggedIn
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const skills = professional.skills || [];
  const displaySkills = skills.slice(0, 3);
  const remainingSkillsCount = Math.max(0, skills.length - 3);

  return (
    <EnhancedCard hover interactive className="group overflow-hidden">
      <CardHeader className="relative pb-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-50" />
        
        <div className="relative flex items-start gap-4">
          <div className="relative">
            <Avatar className="w-16 h-16 ring-2 ring-white shadow-lg">
              <AvatarImage 
                src={professional.avatar_url || `https://images.unsplash.com/photo-${1500000000000 + Math.abs(professional.id.charCodeAt(0) * 1000)}?w=150&h=150&fit=crop&crop=face`}
                alt={professional.full_name}
                onLoad={() => setIsImageLoaded(true)}
              />
              <AvatarFallback className="bg-dna-emerald text-white font-semibold text-lg">
                {getInitials(professional.full_name || 'User')}
              </AvatarFallback>
            </Avatar>
            
            {/* Online Status Indicator */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full shadow-sm" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-gray-900 truncate group-hover:text-dna-emerald transition-colors">
                {professional.full_name}
              </h3>
              {professional.is_mentor && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Mentor
                </Badge>
              )}
            </div>
            
            {professional.profession && (
              <p className="text-sm text-gray-600 font-medium mt-1">
                {professional.profession}
              </p>
            )}
            
            {professional.company && (
              <p className="text-sm text-gray-500">
                {professional.company}
              </p>
            )}

            {connectionStatus !== 'none' && (
              <Badge 
                className={`mt-2 text-xs ${getConnectionStatusColor(connectionStatus)}`}
              >
                {connectionStatus === 'connected' ? 'Connected' : 
                 connectionStatus === 'pending' ? 'Connection Pending' : 'Not Connected'}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Location and Education */}
        <div className="space-y-2">
          {professional.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{professional.location}</span>
            </div>
          )}
          
          {professional.education && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <GraduationCap className="w-4 h-4 text-gray-400" />
              <span className="truncate">{professional.education}</span>
            </div>
          )}
          
          {professional.years_experience && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Briefcase className="w-4 h-4 text-gray-400" />
              <span>{professional.years_experience} years experience</span>
            </div>
          )}
        </div>

        {/* Bio/About */}
        {professional.bio && (
          <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
            {professional.bio}
          </p>
        )}

        {/* Skills */}
        {displaySkills.length > 0 && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {displaySkills.map((skill, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="text-xs px-2 py-1 bg-dna-emerald/10 text-dna-emerald border-dna-emerald/20 hover:bg-dna-emerald/20 transition-colors"
                >
                  {skill}
                </Badge>
              ))}
              {remainingSkillsCount > 0 && (
                <Badge 
                  variant="secondary"
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 border-gray-200"
                >
                  +{remainingSkillsCount} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <EnhancedButton
            onClick={onConnect}
            size="sm"
            className="flex-1"
            disabled={connectionStatus === 'connected' || connectionStatus === 'pending'}
          >
            <UserPlus className="w-4 h-4 mr-1" />
            {connectionStatus === 'connected' ? 'Connected' :
             connectionStatus === 'pending' ? 'Pending' : 'Connect'}
          </EnhancedButton>
          
          <EnhancedButton
            onClick={onMessage}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Message
          </EnhancedButton>
        </div>

        {/* View Profile Link */}
        <div className="pt-2 border-t border-gray-100">
          <button className="flex items-center gap-2 text-sm text-dna-emerald hover:text-dna-forest transition-colors group/link">
            <span>View Full Profile</span>
            <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </CardContent>
    </EnhancedCard>
  );
};

export default EnhancedProfessionalCard;
