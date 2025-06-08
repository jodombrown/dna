
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, User, MessageSquare } from 'lucide-react';
import { Professional } from '@/types/search';

interface ProfessionalCardProps {
  professional: Professional;
  onConnect: () => void;
  onMessage: () => void;
  connectionStatus: string | null;
  isLoggedIn: boolean;
}

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  professional,
  onConnect,
  onMessage,
  connectionStatus,
  isLoggedIn
}) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-dna-copper to-dna-emerald rounded-full flex items-center justify-center">
          <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
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
            onClick={onConnect}
            disabled={!isLoggedIn}
          >
            Connect
          </Button>
        )}
        
        <Button 
          variant="outline"
          onClick={onMessage}
          disabled={!isLoggedIn}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Message
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default ProfessionalCard;
