
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, MessageSquare, UserPlus, MoreHorizontal, Share, ThumbsUp } from 'lucide-react';
import { MockProfessional } from './ProfessionalsMockData';

interface ProfessionalListItemProps {
  professional: MockProfessional;
}

const ProfessionalListItem: React.FC<ProfessionalListItemProps> = ({ professional }) => {
  const getConnectionButton = (status: string | null, professionalName: string) => {
    switch (status) {
      case 'connected':
        return (
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            Message
          </Button>
        );
      case 'pending':
        return (
          <Button variant="outline" size="sm" disabled>
            Request Sent
          </Button>
        );
      default:
        return (
          <Button size="sm" className="bg-dna-emerald hover:bg-dna-forest text-white flex items-center gap-1">
            <UserPlus className="w-4 h-4" />
            Connect
          </Button>
        );
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="w-16 h-16">
              <AvatarImage src={professional.avatar} alt={professional.name} />
              <AvatarFallback className="bg-gradient-to-br from-dna-copper to-dna-emerald text-white">
                {professional.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {professional.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg mb-1">{professional.name}</CardTitle>
                <p className="text-dna-copper font-medium">{professional.title}</p>
                <p className="text-gray-600 text-sm">{professional.company}</p>
              </div>
              <div className="flex items-center gap-2">
                {getConnectionButton(professional.connectionStatus, professional.name)}
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{professional.location}</span>
              </div>
              <span>•</span>
              <span>Originally from {professional.origin}</span>
              {professional.mutualConnections > 0 && (
                <>
                  <span>•</span>
                  <span className="text-dna-emerald">{professional.mutualConnections} mutual connections</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-700">{professional.bio}</p>
        
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Key Skills</div>
          <div className="flex flex-wrap gap-2">
            {professional.skills.map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Recent Activity:</div>
          <div className="text-sm font-medium">{professional.recentActivity}</div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex gap-6 text-sm text-gray-600">
            <span>{professional.followers.toLocaleString()} followers</span>
            <span>{professional.connections.toLocaleString()} connections</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4" />
              Endorse
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <Share className="w-4 h-4" />
              Share Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfessionalListItem;
