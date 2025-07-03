
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useContributions, Contribution } from '@/hooks/useContributions';
import { 
  MessageSquare, 
  Lightbulb, 
  Calendar, 
  Briefcase, 
  Users, 
  FileText,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ContributionsSectionProps {
  userId?: string;
  isOwnProfile?: boolean;
}

const ContributionsSection: React.FC<ContributionsSectionProps> = ({ 
  userId, 
  isOwnProfile = false 
}) => {
  const { contributions, loading } = useContributions(userId);

  const getContributionIcon = (type: Contribution['type']) => {
    switch (type) {
      case 'post':
        return <MessageSquare className="w-4 h-4" />;
      case 'initiative':
        return <Lightbulb className="w-4 h-4" />;
      case 'event':
        return <Calendar className="w-4 h-4" />;
      case 'opportunity':
        return <Briefcase className="w-4 h-4" />;
      case 'community':
        return <Users className="w-4 h-4" />;
      case 'newsletter':
        return <FileText className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getContributionLabel = (type: Contribution['type']) => {
    switch (type) {
      case 'post':
        return 'Created Post';
      case 'initiative':
        return 'Created Initiative';
      case 'event':
        return 'Created Event';
      case 'opportunity':
        return 'Created Opportunity';
      case 'community':
        return 'Joined Community';
      case 'newsletter':
        return 'Published Newsletter';
      default:
        return 'Activity';
    }
  };

  const getContributionColor = (type: Contribution['type']) => {
    switch (type) {
      case 'post':
        return 'bg-blue-100 text-blue-800';
      case 'initiative':
        return 'bg-green-100 text-green-800';
      case 'event':
        return 'bg-purple-100 text-purple-800';
      case 'opportunity':
        return 'bg-orange-100 text-orange-800';
      case 'community':
        return 'bg-pink-100 text-pink-800';
      case 'newsletter':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Group contributions by type
  const groupedContributions = contributions.reduce((acc, contribution) => {
    if (!acc[contribution.type]) {
      acc[contribution.type] = [];
    }
    acc[contribution.type].push(contribution);
    return acc;
  }, {} as Record<string, Contribution[]>);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-dna-copper" />
            Contributions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (contributions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-dna-copper" />
            Contributions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            {isOwnProfile 
              ? "Start contributing to the DNA community by creating posts, joining events, or participating in initiatives!" 
              : "No contributions to display yet."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-dna-copper" />
          Contributions ({contributions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedContributions).map(([type, typeContributions]) => (
          <div key={type}>
            <div className="flex items-center gap-2 mb-3">
              {getContributionIcon(type as Contribution['type'])}
              <h4 className="font-medium text-gray-900">
                {getContributionLabel(type as Contribution['type'])} ({typeContributions.length})
              </h4>
            </div>
            
            <div className="space-y-3 ml-6">
              {typeContributions.slice(0, 5).map((contribution) => (
                <div key={contribution.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {contribution.target_title || `${getContributionLabel(contribution.type)}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(contribution.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge className={getContributionColor(contribution.type)}>
                    {getContributionLabel(contribution.type)}
                  </Badge>
                </div>
              ))}
              
              {typeContributions.length > 5 && (
                <p className="text-sm text-gray-500 italic">
                  ... and {typeContributions.length - 5} more
                </p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ContributionsSection;
