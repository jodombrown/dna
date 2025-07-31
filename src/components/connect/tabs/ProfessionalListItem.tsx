
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, MessageSquare, UserPlus, MoreHorizontal, Share, ThumbsUp } from 'lucide-react';
import { Profile } from '@/services/profilesService';

interface ProfessionalListItemProps {
  professional: Profile;
}

const ProfessionalListItem: React.FC<ProfessionalListItemProps> = ({ professional }) => {
  const getConnectionButton = () => {
    return (
      <Button size="sm" className="bg-dna-emerald hover:bg-dna-forest text-white flex items-center gap-1">
        <UserPlus className="w-4 h-4" />
        Connect
      </Button>
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="w-16 h-16">
              <AvatarImage src={professional.avatar_url || ''} alt={professional.full_name || ''} />
              <AvatarFallback className="bg-gradient-to-br from-dna-copper to-dna-emerald text-white">
                {getInitials(professional.full_name || 'DN')}
              </AvatarFallback>
            </Avatar>
            {professional.is_public && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg mb-1">{professional.full_name}</CardTitle>
                <p className="text-dna-copper font-medium">{professional.profession || professional.professional_role}</p>
                <p className="text-gray-600 text-sm">{professional.company}</p>
              </div>
              <div className="flex items-center gap-2">
                {getConnectionButton()}
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{professional.location || professional.current_country}</span>
              </div>
              {professional.country_of_origin && (
                <>
                  <span>•</span>
                  <span>Originally from {professional.country_of_origin}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {professional.bio && <p className="text-gray-700">{professional.bio}</p>}
        
        {professional.skills && professional.skills.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Key Skills</div>
            <div className="flex flex-wrap gap-2">
              {professional.skills.map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {professional.years_experience && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">Experience:</div>
            <div className="text-sm font-medium">{professional.years_experience} years</div>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex gap-6 text-sm text-gray-600">
            <span>{professional.industry || 'Professional'}</span>
            {professional.available_for?.includes('opportunities') && <span>• Open to opportunities</span>}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              Message
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <Share className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfessionalListItem;
