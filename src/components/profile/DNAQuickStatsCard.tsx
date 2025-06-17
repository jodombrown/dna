
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DNAQuickStatsCardProps {
  profile: any;
  userPosts: any[];
  userEvents: any[];
}

const DNAQuickStatsCard: React.FC<DNAQuickStatsCardProps> = ({
  profile,
  userPosts,
  userEvents
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-dna-forest">DNA Impact</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Profile Views</span>
          <span className="font-semibold text-dna-emerald">42</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Network Size</span>
          <span className="font-semibold text-dna-emerald">{profile?.followers_count || 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Posts Created</span>
          <span className="font-semibold text-dna-emerald">{userPosts.length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Events Hosted</span>
          <span className="font-semibold text-dna-emerald">{userEvents.length}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default DNAQuickStatsCard;
