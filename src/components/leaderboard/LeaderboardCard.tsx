import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Medal, 
  Award, 
  MapPin, 
  TrendingUp,
  Crown,
  Star,
  Users,
  MessageCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LeaderboardUser {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  score: number;
  rank: number;
  location?: string;
  pillar_scores?: {
    connect: number;
    collaborate: number;
    contribute: number;
  };
  is_verified?: boolean;
  impact_type?: string;
}

interface LeaderboardCardProps {
  users: LeaderboardUser[];
  type: 'total' | 'connect' | 'collaborate' | 'contribute';
  title: string;
  className?: string;
}

export function LeaderboardCard({ users, type, title, className = '' }: LeaderboardCardProps) {
  const navigate = useNavigate();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getPillarColor = (type: string) => {
    switch (type) {
      case 'connect':
        return 'text-dna-emerald bg-dna-emerald/10';
      case 'collaborate':
        return 'text-dna-copper bg-dna-copper/10';
      case 'contribute':
        return 'text-dna-forest bg-dna-forest/10';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getVerificationBadge = (user: LeaderboardUser) => {
    if (!user.is_verified) return null;
    
    return (
      <div className="flex items-center gap-1">
        <Crown className="h-3 w-3 text-dna-gold" />
        <span className="text-xs text-dna-gold font-medium">
          {user.impact_type ? user.impact_type.charAt(0).toUpperCase() + user.impact_type.slice(1) : 'Verified'}
        </span>
      </div>
    );
  };

  return (
    <Card className={`h-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-dna-emerald" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No rankings available yet</p>
            <p className="text-sm">Start engaging to appear on the leaderboard!</p>
          </div>
        ) : (
          users.slice(0, 10).map((user) => (
            <div key={user.user_id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center gap-2 min-w-[40px]">
                  {getRankIcon(user.rank)}
                </div>
                
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar_url} alt={user.full_name} />
                  <AvatarFallback className="bg-dna-emerald/10 text-dna-emerald">
                    {user.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm truncate">{user.full_name}</h4>
                    {getVerificationBadge(user)}
                  </div>
                  
                  {user.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {user.location}
                    </div>
                  )}
                  
                  {user.pillar_scores && type === 'total' && (
                    <div className="flex gap-1 mt-1">
                      <Badge variant="secondary" className="text-xs py-0 px-1">
                        C: {user.pillar_scores.connect}
                      </Badge>
                      <Badge variant="secondary" className="text-xs py-0 px-1">
                        Col: {user.pillar_scores.collaborate}
                      </Badge>
                      <Badge variant="secondary" className="text-xs py-0 px-1">
                        Con: {user.pillar_scores.contribute}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={getPillarColor(type)}>
                  {user.score} pts
                </Badge>
                
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => navigate(`/profile/${user.full_name?.replace(' ', '-').toLowerCase()}`)}
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => navigate('/messaging', { state: { userId: user.user_id } })}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
        
        {users.length > 10 && (
          <div className="text-center pt-4 border-t">
            <Button variant="outline" size="sm" onClick={() => navigate('/leaderboard')}>
              View Full Leaderboard
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}