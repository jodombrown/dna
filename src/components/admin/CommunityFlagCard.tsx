
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  AlertTriangle, 
  Calendar,
  User,
  Flag,
  MessageSquare
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommunityFlagCardProps {
  flag: any;
  onResolve: (flagId: string, status: string, notes?: string) => void;
  onViewDetails: (flag: any) => void;
  isLoading: boolean;
}

const CommunityFlagCard: React.FC<CommunityFlagCardProps> = ({
  flag,
  onResolve,
  onViewDetails,
  isLoading
}) => {
  const getFlagTypeBadge = (flagType: string) => {
    const colors = {
      inappropriate_content: 'bg-red-100 text-red-800 border-red-200',
      spam: 'bg-orange-100 text-orange-800 border-orange-200',
      harassment: 'bg-purple-100 text-purple-800 border-purple-200',
      misinformation: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      copyright_violation: 'bg-blue-100 text-blue-800 border-blue-200',
      fake_community: 'bg-pink-100 text-pink-800 border-pink-200',
      other: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[flagType as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityIcon = (flagType: string) => {
    if (flagType === 'harassment' || flagType === 'inappropriate_content') {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
    return <Flag className="w-4 h-4 text-gray-500" />;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getPriorityIcon(flag.flag_type)}
            <div>
              <div className="flex items-center gap-2">
                <Badge className={getFlagTypeBadge(flag.flag_type)}>
                  {flag.flag_type.replace('_', ' ')}
                </Badge>
                <Badge variant="outline">Community Flag</Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Community: {flag.community?.name || 'Unknown'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(flag.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {flag.community && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
              <Avatar className="w-10 h-10">
                <AvatarImage src={flag.community.image_url} alt={flag.community.name} />
                <AvatarFallback>
                  {flag.community.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{flag.community.name}</p>
                <p className="text-sm text-gray-500">
                  {flag.community.member_count} members • {flag.community.category}
                </p>
              </div>
            </div>
          )}

          {flag.reason && (
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
              <p className="text-sm text-gray-700 line-clamp-2">{flag.reason}</p>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <User className="w-4 h-4" />
            <span>Flagged by: {flag.flagged_by?.substring(0, 8)}...</span>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(flag)}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Review
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onResolve(flag.id, 'approved')}
                disabled={isLoading}
                className="text-green-600 hover:text-green-700"
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onResolve(flag.id, 'rejected')}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityFlagCard;
