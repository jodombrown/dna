import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  Briefcase, 
  Crown, 
  Star, 
  MessageCircle, 
  UserPlus,
  CheckCircle,
  Clock,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileUser {
  id: string;
  full_name: string;
  headline?: string;
  location?: string;
  industry?: string;
  avatar_url?: string;
  is_verified?: boolean;
  verification_type?: string;
  connection_status?: 'not_connected' | 'pending' | 'connected';
  dna_score?: {
    total: number;
    connect: number;
    collaborate: number;
    contribute: number;
  };
  badges?: Array<{
    name: string;
    type: string;
    icon?: string;
  }>;
  activity_status?: 'online' | 'offline' | 'away';
  last_active?: string;
}

interface EnhancedProfileCardProps {
  user: ProfileUser;
  showConnectionButton?: boolean;
  showMessageButton?: boolean;
  onConnect?: (userId: string) => void;
  onMessage?: (userId: string) => void;
  className?: string;
}

export function EnhancedProfileCard({ 
  user, 
  showConnectionButton = true,
  showMessageButton = true,
  onConnect,
  onMessage,
  className = ''
}: EnhancedProfileCardProps) {
  const navigate = useNavigate();

  const getVerificationBadge = () => {
    if (!user.is_verified) return null;
    
    const verificationConfig = {
      startup: { color: 'text-purple-600 bg-purple-50', label: 'Startup Founder' },
      policy: { color: 'text-blue-600 bg-blue-50', label: 'Policy Expert' },
      research: { color: 'text-green-600 bg-green-50', label: 'Researcher' },
      education: { color: 'text-orange-600 bg-orange-50', label: 'Educator' },
      infrastructure: { color: 'text-red-600 bg-red-50', label: 'Infrastructure' },
      default: { color: 'text-dna-gold bg-dna-gold/10', label: 'Verified' }
    };
    
    const config = verificationConfig[user.verification_type as keyof typeof verificationConfig] || verificationConfig.default;
    
    return (
      <Badge className={`${config.color} border-0 text-xs font-medium`}>
        <Crown className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getConnectionButton = () => {
    if (!showConnectionButton) return null;
    
    switch (user.connection_status) {
      case 'connected':
        return (
          <Button variant="outline" size="sm" className="flex-1">
            <CheckCircle className="h-4 w-4 mr-2" />
            Connected
          </Button>
        );
      case 'pending':
        return (
          <Button variant="outline" size="sm" className="flex-1" disabled>
            <Clock className="h-4 w-4 mr-2" />
            Pending
          </Button>
        );
      default:
        return (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 hover:bg-dna-emerald hover:text-white"
            onClick={() => onConnect?.(user.id)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Connect
          </Button>
        );
    }
  };

  const getActivityIndicator = () => {
    if (!user.activity_status) return null;
    
    const statusConfig = {
      online: { color: 'bg-green-500', label: 'Online' },
      away: { color: 'bg-yellow-500', label: 'Away' },
      offline: { color: 'bg-gray-400', label: 'Offline' }
    };
    
    const config = statusConfig[user.activity_status];
    
    return (
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${config.color}`} />
        <span className="text-xs text-muted-foreground">{config.label}</span>
      </div>
    );
  };

  const getDNAScoreBadges = () => {
    if (!user.dna_score) return null;
    
    return (
      <div className="flex gap-1">
        <Badge variant="secondary" className="text-xs bg-dna-emerald/10 text-dna-emerald">
          C: {user.dna_score.connect}
        </Badge>
        <Badge variant="secondary" className="text-xs bg-dna-copper/10 text-dna-copper">
          Col: {user.dna_score.collaborate}
        </Badge>
        <Badge variant="secondary" className="text-xs bg-dna-forest/10 text-dna-forest">
          Con: {user.dna_score.contribute}
        </Badge>
      </div>
    );
  };

  return (
    <Card className={`hover:shadow-md transition-shadow duration-200 ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header with Avatar and Basic Info */}
          <div className="flex items-start gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar_url} alt={user.full_name} />
                <AvatarFallback className="bg-dna-emerald/10 text-dna-emerald font-medium">
                  {user.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              {user.activity_status === 'online' && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 
                  className="font-semibold text-gray-900 truncate cursor-pointer hover:text-dna-emerald transition-colors"
                  onClick={() => navigate(`/profile/${user.full_name?.replace(' ', '-').toLowerCase()}`)}
                >
                  {user.full_name}
                </h3>
                {getVerificationBadge()}
              </div>
              
              {user.headline && (
                <p className="text-sm text-muted-foreground truncate mb-1">
                  {user.headline}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {user.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {user.location}
                  </div>
                )}
                {user.industry && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {user.industry}
                  </div>
                )}
                {getActivityIndicator()}
              </div>
            </div>
          </div>

          {/* DNA Scores */}
          {user.dna_score && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">DNA Impact Score</span>
                <Badge className="bg-dna-mint text-dna-forest">
                  {user.dna_score.total} pts
                </Badge>
              </div>
              {getDNAScoreBadges()}
            </div>
          )}

          {/* Achievement Badges */}
          {user.badges && user.badges.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Achievements</span>
              <div className="flex flex-wrap gap-1">
                {user.badges.slice(0, 3).map((badge, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {badge.icon && <span className="mr-1">{badge.icon}</span>}
                    {badge.name}
                  </Badge>
                ))}
                {user.badges.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{user.badges.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {getConnectionButton()}
            {showMessageButton && (
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 hover:bg-dna-copper hover:text-white"
                onClick={() => onMessage?.(user.id)}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}