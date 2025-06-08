
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users as UsersIcon } from 'lucide-react';
import { Community } from '@/types/search';

interface CommunityCardProps {
  community: Community;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ community }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader>
      <CardTitle className="text-lg">{community.name}</CardTitle>
      <Badge variant="outline">{community.category}</Badge>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600 mb-4">{community.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <UsersIcon className="w-4 h-4" />
          {community.member_count} members
        </div>
        <Button size="sm" className="bg-dna-emerald hover:bg-dna-forest text-white">
          Join
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default CommunityCard;
