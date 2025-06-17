
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface DNARecentActivityCardProps {
  userPosts: any[];
  isOwnProfile: boolean;
}

const DNARecentActivityCard: React.FC<DNARecentActivityCardProps> = ({
  userPosts,
  isOwnProfile
}) => {
  if (isOwnProfile || userPosts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-dna-forest flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {userPosts.slice(0, 3).map((post: any) => (
            <div key={post.id} className="text-sm">
              <p className="text-gray-800 line-clamp-2">{post.content}</p>
              <span className="text-xs text-gray-500">
                {new Date(post.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DNARecentActivityCard;
