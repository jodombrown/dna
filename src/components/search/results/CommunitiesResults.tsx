
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Community } from '@/hooks/useSearch';

interface CommunitiesResultsProps {
  communities: Community[];
}

const CommunitiesResults: React.FC<CommunitiesResultsProps> = ({
  communities
}) => {
  if (communities.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Communities</h3>
      {communities.map((community) => (
        <Card key={community.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {community.name}
                </h3>
                {community.description && (
                  <p className="text-gray-600 text-sm mt-1">
                    {community.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  {community.category && (
                    <Badge variant="outline">{community.category}</Badge>
                  )}
                  <span className="text-sm text-gray-500">
                    {community.member_count} members
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-dna-emerald hover:bg-dna-forest text-white"
              >
                Join Community
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CommunitiesResults;
