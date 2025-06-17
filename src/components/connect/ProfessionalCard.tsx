
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, MessageSquare } from 'lucide-react';
import { Professional } from '@/types/search';
import ConnectDialogs from './ConnectDialogs';

interface ProfessionalCardProps {
  professional: Professional;
  onConnect: () => void;
  onMessage: () => void;
  connectionStatus: string | null;
  isLoggedIn: boolean;
}

// Helper function to generate culturally appropriate profile images for African professionals
const getProfileImage = (name: string, countryOfOrigin: string) => {
  // Map of diverse African professional images - different image for each name
  const imageMap: { [key: string]: string } = {
    // African Women
    'Amara Okafor': 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face',
    'Zara Mbeki': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    'Fatima Hassan': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=150&h=150&fit=crop&crop=face',
    'Sarah Mwangi': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    'Aisha Kone': 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=150&h=150&fit=crop&crop=face',
    'Kemi Adebisi': 'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=150&h=150&fit=crop&crop=face',
    'Adaora Okafor': 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
    'Dr. Fatima Al-Rashid': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    
    // African Men
    'Kwame Asante': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    'Ibrahim Hassan': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    'Kofi Mensah': 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
    'Sekou Traore': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    'Emeka Okonkwo': 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150&h=150&fit=crop&crop=face',
    'Thierry Mukendi': 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face',
    'Ahmed El-Rashid': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    'Moses Kiprotich': 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face',
    'Omar Benali': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    'Chidi Okwu': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    'Prof. Kwame Asante': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    'Dr. Amara Okafor': 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face',
    
    // Additional diverse images
    'Yasmin El-Sayed': 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&h=150&fit=crop&crop=face',
    'Tariq Osman': 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150&h=150&fit=crop&crop=face'
  };

  // Return specific image for known names, or fallback to a default based on gender hints
  if (imageMap[name]) {
    return imageMap[name];
  }

  // Fallback based on name patterns for African names
  const femaleNames = ['Amara', 'Zara', 'Fatima', 'Aisha', 'Ngozi', 'Yasmin', 'Kemi', 'Adaora', 'Safiya', 'Sarah'];
  const isLikelyFemale = femaleNames.some(fname => name.includes(fname));
  
  if (isLikelyFemale) {
    return 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face';
  } else {
    return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face';
  }
};

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  professional,
  onConnect,
  onMessage,
  connectionStatus,
  isLoggedIn
}) => {
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isJoinCommunityDialogOpen, setIsJoinCommunityDialogOpen] = useState(false);
  const [isRegisterEventDialogOpen, setIsRegisterEventDialogOpen] = useState(false);

  const handleConnectClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoggedIn) {
      onConnect();
    } else {
      setIsConnectDialogOpen(true);
    }
  };

  const handleMessageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoggedIn) {
      onMessage();
    } else {
      setIsMessageDialogOpen(true);
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="w-12 h-12 sm:w-16 sm:h-16">
              <AvatarImage 
                src={getProfileImage(professional.full_name, professional.country_of_origin)} 
                alt={professional.full_name}
              />
              <AvatarFallback className="bg-gradient-to-br from-dna-copper to-dna-emerald text-white">
                {professional.full_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg mb-1">{professional.full_name}</CardTitle>
              <p className="text-dna-copper font-medium text-sm sm:text-base">{professional.profession}</p>
              <p className="text-gray-600 text-xs sm:text-sm">{professional.company}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{professional.location} • Originally from {professional.country_of_origin}</span>
          </div>
          
          {professional.expertise && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Expertise</div>
              <div className="flex flex-wrap gap-1">
                {professional.expertise.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {professional.availability_for && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Available For</div>
              <div className="flex flex-wrap gap-1">
                {professional.availability_for.map((service, index) => (
                  <Badge key={index} className="text-xs bg-dna-emerald/20 text-dna-emerald">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {professional.bio && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm">{professional.bio.length > 100 ? `${professional.bio.substring(0, 100)}...` : professional.bio}</div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {connectionStatus === 'accepted' ? (
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            ) : connectionStatus === 'pending' ? (
              <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
            ) : (
              <Button 
                className="flex-1 bg-dna-emerald hover:bg-dna-forest text-white"
                onClick={handleConnectClick}
              >
                Connect
              </Button>
            )}
            
            <Button 
              variant="outline"
              onClick={handleMessageClick}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Message
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConnectDialogs
        isConnectDialogOpen={isConnectDialogOpen}
        setIsConnectDialogOpen={setIsConnectDialogOpen}
        isMessageDialogOpen={isMessageDialogOpen}
        setIsMessageDialogOpen={setIsMessageDialogOpen}
        isJoinCommunityDialogOpen={isJoinCommunityDialogOpen}
        setIsJoinCommunityDialogOpen={setIsJoinCommunityDialogOpen}
        isRegisterEventDialogOpen={isRegisterEventDialogOpen}
        setIsRegisterEventDialogOpen={setIsRegisterEventDialogOpen}
      />
    </>
  );
};

export default ProfessionalCard;
