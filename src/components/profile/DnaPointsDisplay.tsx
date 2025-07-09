import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Handshake, Heart } from 'lucide-react';
import { useDnaPoints, useUserBadges } from '@/hooks/useDnaPoints';

interface DnaPointsDisplayProps {
  userId: string;
}

const DnaPointsDisplay = ({ userId }: DnaPointsDisplayProps) => {
  const { data: points, isLoading } = useDnaPoints(userId);
  const { data: badges } = useUserBadges(userId);

  if (isLoading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-dna-gold" />
          DNA Impact Points
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-dna-emerald">{points?.total_score || 0}</div>
          <p className="text-sm text-muted-foreground">Total Impact Score</p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <Users className="h-4 w-4 mx-auto mb-1 text-dna-mint" />
            <div className="font-semibold">{points?.connect_score || 0}</div>
            <div className="text-xs text-muted-foreground">Connect</div>
          </div>
          <div>
            <Handshake className="h-4 w-4 mx-auto mb-1 text-dna-copper" />
            <div className="font-semibold">{points?.collaborate_score || 0}</div>
            <div className="text-xs text-muted-foreground">Collaborate</div>
          </div>
          <div>
            <Heart className="h-4 w-4 mx-auto mb-1 text-dna-emerald" />
            <div className="font-semibold">{points?.contribute_score || 0}</div>
            <div className="text-xs text-muted-foreground">Contribute</div>
          </div>
        </div>

        {badges && badges.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Recent Badges</h4>
            <div className="flex flex-wrap gap-2">
              {badges.slice(0, 6).map((badge) => (
                <Badge key={badge.id} variant="secondary" className="text-xs">
                  {badge.icon} {badge.badge_name}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground">
          DNA Points reflect your verified contributions, collaborations, and platform engagement.
        </p>
      </CardContent>
    </Card>
  );
};

export default DnaPointsDisplay;