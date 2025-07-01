
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Building, Users, MessageSquare, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { Professional } from '@/types/search';

interface EnhancedProfessionalCardProps {
  professional: Professional;
  onConnect: () => void;
  onMessage: () => void;
  connectionStatus?: 'none' | 'pending' | 'connected';
  isLoggedIn: boolean;
}

const EnhancedProfessionalCard: React.FC<EnhancedProfessionalCardProps> = ({
  professional,
  onConnect,
  onMessage,
  connectionStatus = 'none',
  isLoggedIn
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSkillsArray = (skills: any): string[] => {
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string') return skills.split(',').map(s => s.trim());
    return [];
  };

  const skillsArray = getSkillsArray(professional.skills);
  const displayedSkills = isExpanded ? skillsArray : skillsArray.slice(0, 3);

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-0 shadow-md hover:shadow-2xl relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-dna-emerald/5 to-dna-copper/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start space-x-4 mb-4">
          <div className="relative">
            <Avatar className="w-16 h-16 ring-2 ring-white shadow-lg transition-transform duration-200 group-hover:scale-105">
              <AvatarImage src={professional.avatar_url} alt={professional.full_name} />
              <AvatarFallback className="bg-gradient-to-br from-dna-copper to-dna-emerald text-white text-lg font-bold">
                {professional.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {professional.is_mentor && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-dna-gold rounded-full flex items-center justify-center shadow-md">
                <Award className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-dna-forest transition-colors">
              {professional.full_name}
            </h3>
            
            {professional.profession && (
              <p className="text-dna-copper font-semibold text-sm mb-2">
                {professional.profession}
              </p>
            )}
            
            <div className="space-y-1">
              {professional.company && (
                <div className="flex items-center text-gray-600 text-xs">
                  <Building className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{professional.company}</span>
                </div>
              )}
              
              {professional.location && (
                <div className="flex items-center text-gray-600 text-xs">
                  <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{professional.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {professional.bio && (
          <p className="text-gray-700 text-sm mb-4 leading-relaxed line-clamp-3 group-hover:text-gray-800 transition-colors">
            {professional.bio}
          </p>
        )}

        {/* Skills with expand/collapse */}
        {skillsArray.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1 mb-2">
              {displayedSkills.map((skill, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs border-dna-emerald/30 text-dna-forest hover:bg-dna-emerald/10 transition-colors"
                >
                  {skill}
                </Badge>
              ))}
              {skillsArray.length > 3 && !isExpanded && (
                <Badge variant="outline" className="text-xs text-gray-500 cursor-pointer hover:bg-gray-100">
                  +{skillsArray.length - 3} more
                </Badge>
              )}
            </div>
            
            {skillsArray.length > 3 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center text-xs text-dna-emerald hover:text-dna-forest transition-colors"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-3 h-3 mr-1" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3 mr-1" />
                    Show more skills
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Status badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {professional.is_mentor && (
            <Badge className="text-xs bg-dna-mint/20 text-dna-forest border-dna-mint">
              Available for Mentoring
            </Badge>
          )}
          {professional.is_investor && (
            <Badge className="text-xs bg-dna-gold/20 text-dna-forest border-dna-gold">
              Angel Investor
            </Badge>
          )}
          {professional.looking_for_opportunities && (
            <Badge className="text-xs bg-dna-copper/20 text-dna-forest border-dna-copper">
              Open to Opportunities
            </Badge>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="flex space-x-2">
          <EnhancedButton
            size="sm"
            variant="dna"
            onClick={onConnect}
            disabled={!isLoggedIn || connectionStatus === 'connected'}
            className="flex-1"
          >
            <Users className="w-4 h-4" />
            {connectionStatus === 'connected' ? 'Connected' : 
             connectionStatus === 'pending' ? 'Pending' : 'Connect'}
          </EnhancedButton>
          
          <EnhancedButton
            size="sm"
            variant="outline"
            onClick={onMessage}
            disabled={!isLoggedIn}
            className="flex-1"
          >
            <MessageSquare className="w-4 h-4" />
            Message
          </EnhancedButton>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedProfessionalCard;
