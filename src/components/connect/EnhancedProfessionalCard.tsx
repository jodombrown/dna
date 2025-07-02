
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TouchFriendlyButton } from '@/components/ui/mobile-optimized';
import { MapPin, Building, MessageSquare, UserPlus, Star, Award, TrendingUp } from 'lucide-react';
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
  // High-quality profile images featuring Black/African individuals
  const getProfileImage = (id: string) => {
    const images = [
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1594736797933-d0c1ac17e5d3?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face'
    ];
    const index = parseInt(id.substring(0, 2), 16) % images.length;
    return images[index];
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-0 shadow-md relative overflow-hidden h-full animate-fade-in">
      {/* Featured badge */}
      {professional.is_featured && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-dna-gold hover:bg-dna-copper text-white shadow-md transition-colors">
            <Star className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 ring-2 ring-dna-copper/20 flex-shrink-0">
            <AvatarImage 
              src={getProfileImage(professional.id)} 
              alt={professional.full_name}
              className="object-cover w-full h-full"
            />
            <AvatarFallback className="bg-dna-mint text-dna-forest font-semibold text-lg">
              {professional.full_name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-dna-forest transition-colors line-clamp-1">
              {professional.full_name}
            </h3>
            
            {professional.profession && (
              <p className="text-dna-emerald font-medium text-sm mb-2 line-clamp-1">
                {professional.profession}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mb-3">
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
      </CardHeader>

      <CardContent className="pt-0 flex flex-col justify-between h-full">
        <div>
          <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3 group-hover:text-gray-800 transition-colors">
            {professional.bio}
          </p>

          {/* Skills/Interests Tags */}
          {professional.skills && professional.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {professional.skills.slice(0, 3).map((skill, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="text-xs hover:bg-dna-mint hover:text-dna-forest hover:border-dna-mint transition-all cursor-default"
                >
                  {skill}
                </Badge>
              ))}
              {professional.skills.length > 3 && (
                <Badge variant="outline" className="text-xs text-gray-500">
                  +{professional.skills.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Professional attributes */}
          <div className="flex flex-wrap gap-2 mb-4">
            {professional.is_mentor && (
              <Badge className="bg-dna-emerald/10 text-dna-emerald hover:bg-dna-emerald hover:text-white transition-colors text-xs">
                <Award className="w-3 h-3 mr-1" />
                Mentor
              </Badge>
            )}
            {professional.is_investor && (
              <Badge className="bg-dna-copper/10 text-dna-copper hover:bg-dna-copper hover:text-white transition-colors text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                Investor
              </Badge>
            )}
            {professional.looking_for_opportunities && (
              <Badge className="bg-dna-gold/10 text-dna-gold hover:bg-dna-gold hover:text-white transition-colors text-xs">
                Open to Opportunities
              </Badge>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-auto">
          <div className="flex gap-2">
            <TouchFriendlyButton
              onClick={onConnect}
              disabled={!isLoggedIn}
              variant="default"
              size="sm"
              className="flex-1 bg-dna-emerald hover:bg-dna-forest text-white border-0"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Connect
            </TouchFriendlyButton>
            <TouchFriendlyButton
              onClick={onMessage}
              disabled={!isLoggedIn}
              variant="outline"
              size="sm"
              className="flex-1 border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white transition-all"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Message
            </TouchFriendlyButton>
          </div>
          
          {!isLoggedIn && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Sign in to connect with professionals and unlock networking features
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedProfessionalCard;
