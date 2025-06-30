
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Ban,
  Trash2,
  Users,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommunityCardProps {
  community: any;
  onModerate: (communityId: string, status: string, notes?: string, rejectionReason?: string) => void;
  onDelete: (communityId: string) => void;
  onViewDetails: (community: any) => void;
  isLoading: boolean;
}

const CommunityCard: React.FC<CommunityCardProps> = ({
  community,
  onModerate,
  onDelete,
  onViewDetails,
  isLoading
}) => {
  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      suspended: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityIcon = (status: string) => {
    if (status === 'pending') {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
    return <Users className="w-4 h-4 text-gray-500" />;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={community.image_url} alt={community.name} />
              <AvatarFallback>
                {community.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                {getPriorityIcon(community.moderation_status)}
                <h3 className="font-semibold text-lg">{community.name}</h3>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusBadge(community.moderation_status)}>
                  {community.moderation_status}
                </Badge>
                {community.category && (
                  <Badge variant="outline">{community.category}</Badge>
                )}
                {community.is_featured && (
                  <Badge className="bg-dna-gold text-white">Featured</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(community.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {community.description && (
            <p className="text-sm text-gray-700 line-clamp-2">{community.description}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{community.member_count} members</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDistanceToNow(new Date(community.created_at))} old</span>
            </div>
          </div>

          {community.moderator_notes && (
            <div className="p-2 bg-gray-50 rounded text-sm">
              <strong>Moderator Notes:</strong> {community.moderator_notes}
            </div>
          )}

          {community.rejection_reason && (
            <div className="p-2 bg-red-50 rounded text-sm text-red-700">
              <strong>Rejection Reason:</strong> {community.rejection_reason}
            </div>
          )}
          
          <div className="flex items-center justify-between pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(community)}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Details
            </Button>
            
            <div className="flex gap-2">
              {community.moderation_status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onModerate(community.id, 'approved')}
                    disabled={isLoading}
                    className="text-green-600 hover:text-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onModerate(community.id, 'rejected')}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </>
              )}
              
              {community.moderation_status === 'approved' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onModerate(community.id, 'suspended')}
                  disabled={isLoading}
                  className="text-orange-600 hover:text-orange-700"
                >
                  <Ban className="w-4 h-4" />
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(community.id)}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityCard;
