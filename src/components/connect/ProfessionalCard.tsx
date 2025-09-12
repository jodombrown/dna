
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  Briefcase, 
  MessageSquare, 
  UserPlus, 
  Globe,
  Heart,
  Star,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Professional } from '@/types/search';
import { useToast } from '@/hooks/use-toast';

interface ProfessionalCardProps {
  professional: Professional;
  onConnect?: () => void;
  onMessage?: () => void;
  connectionStatus?: any;
  isLoggedIn?: boolean;
}

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({ 
  professional, 
  onConnect, 
  onMessage, 
  connectionStatus, 
  isLoggedIn 
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    setIsConnecting(true);
    
    // Simulate connection request
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      if (onConnect) onConnect();
      toast({
        title: "Connection Request Sent",
        description: `Your request to connect with ${professional.full_name || professional.username || 'this professional'} has been sent.`,
      });
    }, 1000);
  };

  const handleMessage = () => {
    if (onMessage) {
      onMessage();
    } else {
      toast({
        title: "Messaging Available Soon",
        description: "Direct messaging will be available in the next release.",
      });
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-dna-emerald overflow-hidden">
      <CardContent className="p-0">
        {/* Header with Avatar and Basic Info */}
        <div className="p-4 pb-3">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0">
              <Avatar className="w-12 h-12 ring-2 ring-dna-emerald/20 group-hover:ring-dna-emerald/40 transition-all">
                <AvatarImage 
                  src={professional.avatar_url || ''} 
                  alt={professional.full_name || professional.username || ''} 
                />
                <AvatarFallback className="bg-dna-forest text-white font-semibold">
                  {(professional.full_name || professional.username || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="block group-hover:text-dna-emerald transition-colors">
                <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
                  {professional.full_name || professional.username}
                </h3>
              </div>
              
              {professional.headline && (
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">
                  {professional.headline}
                </p>
              )}
              
              {/* Location and Origin */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {professional.location && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    <MapPin className="w-3 h-3 mr-1" />
                    {professional.location}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Connection Status Indicator */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-2 h-2 bg-dna-emerald rounded-full animate-pulse"></div>
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
          </div>
          
          {/* Professional Info */}
          {professional.profession && (
            <div className="flex items-center gap-1 mb-3">
              <Briefcase className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {professional.profession}
                {professional.company && ` at ${professional.company}`}
              </span>
            </div>
          )}
          
          {/* Bio Preview */}
          {professional.bio && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {professional.bio}
            </p>
          )}
          
          {/* Skills */}
          {professional.skills && professional.skills.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {professional.skills.slice(0, 3).map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs px-2 py-0.5 bg-dna-copper/10 text-dna-copper border-dna-copper/20"
                  >
                    {skill}
                  </Badge>
                ))}
                {professional.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    +{professional.skills.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Impact Areas */}
          {professional.impact_areas && professional.impact_areas.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1 mb-1">
                <Heart className="w-3 h-3 text-dna-gold" />
                <span className="text-xs font-medium text-dna-gold">Impact Areas</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {professional.impact_areas.slice(0, 2).map((area, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs px-2 py-0.5 bg-dna-gold/10 text-dna-gold border-dna-gold/20"
                  >
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="border-t bg-muted/30 p-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={isConnected ? "secondary" : "default"}
              size="sm"
              onClick={handleConnect}
              disabled={isConnecting || isConnected}
              className={`text-xs h-8 ${
                isConnected 
                  ? 'bg-dna-emerald/10 text-dna-emerald border-dna-emerald/20' 
                  : 'bg-dna-emerald hover:bg-dna-emerald/90'
              }`}
            >
              {isConnecting ? (
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1" />
              ) : isConnected ? (
                <Users className="w-3 h-3 mr-1" />
              ) : (
                <UserPlus className="w-3 h-3 mr-1" />
              )}
              {isConnected ? 'Connected' : 'Connect'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleMessage}
              className="text-xs h-8 hover:bg-dna-copper/10 hover:border-dna-copper/30 hover:text-dna-copper"
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              Message
            </Button>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>0 mutual</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                <span>4.8 rating</span>
              </div>
            </div>
            <div className="text-xs text-dna-emerald hover:text-dna-emerald/80 font-medium cursor-pointer">
              View Profile →
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfessionalCard;

