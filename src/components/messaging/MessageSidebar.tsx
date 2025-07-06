import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Calendar, 
  MapPin, 
  Globe, 
  Briefcase,
  Users,
  Star,
  MoreHorizontal
} from 'lucide-react';

interface MessageSidebarProps {
  conversationId: string | null;
}

const MessageSidebar: React.FC<MessageSidebarProps> = ({ conversationId }) => {
  if (!conversationId) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
          <p className="text-sm">Select a conversation to view details</p>
        </div>
      </div>
    );
  }

  // Mock data for demonstration
  const contactInfo = {
    name: 'Sarah Okoye',
    role: 'Tech Entrepreneur',
    company: 'African Innovation Labs',
    location: 'Lagos, Nigeria',
    avatar: null,
    connection: 'mutual',
    mutualConnections: 12
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Contact Profile */}
      <Card className="border-0 border-b rounded-none">
        <CardHeader className="text-center pb-4">
          <Avatar className="h-20 w-20 mx-auto mb-4">
            <AvatarImage src={contactInfo.avatar} />
            <AvatarFallback className="bg-dna-emerald text-white text-lg">
              {contactInfo.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-lg text-dna-forest">{contactInfo.name}</CardTitle>
          <p className="text-sm text-gray-600">{contactInfo.role}</p>
          <p className="text-sm text-gray-500">{contactInfo.company}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{contactInfo.location}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{contactInfo.mutualConnections} mutual connections</span>
          </div>
          <div className="flex items-center justify-center space-x-2 pt-2">
            <Button size="sm" variant="outline" className="flex-1">
              <User className="h-4 w-4 mr-1" />
              View Profile
            </Button>
            <Button size="sm" variant="outline">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 border-b rounded-none">
        <CardHeader>
          <CardTitle className="text-sm text-dna-forest">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Star className="h-4 w-4 mr-2" />
            Star conversation
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule meeting
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Briefcase className="h-4 w-4 mr-2" />
            View collaboration
          </Button>
        </CardContent>
      </Card>

      {/* Connection Info */}
      <Card className="border-0 rounded-none">
        <CardHeader>
          <CardTitle className="text-sm text-dna-forest">Connection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Badge variant="secondary" className="text-xs">
              {contactInfo.connection === 'mutual' ? 'Mutual Connection' : 'Direct Connection'}
            </Badge>
            <p className="text-xs text-gray-500">
              Connected through DNA Network
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessageSidebar;