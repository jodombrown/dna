import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Calendar, 
  FileText, 
  Star,
  Archive,
  Settings
} from 'lucide-react';

interface MessageSidebarProps {
  conversationId: string | null;
}

const MessageSidebar: React.FC<MessageSidebarProps> = ({ conversationId }) => {
  // Mock data for sidebar features
  const quickActions = [
    { icon: Star, label: 'Starred Messages', count: 3 },
    { icon: Archive, label: 'Archived', count: 12 },
    { icon: FileText, label: 'Files Shared', count: 8 },
    { icon: Calendar, label: 'Events', count: 2 }
  ];

  const groupChats = [
    {
      id: '1',
      name: 'Tech Leaders',
      members: 12,
      lastActive: '2 hours ago'
    },
    {
      id: '2', 
      name: 'African Entrepreneurs',
      members: 8,
      lastActive: '1 day ago'
    }
  ];

  if (!conversationId) {
    return (
      <div className="h-full p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-dna-forest">Messaging Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.label}
                  variant="ghost"
                  className="w-full justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{action.label}</span>
                  </div>
                  <Badge variant="secondary">{action.count}</Badge>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg text-dna-forest">Group Chats</CardTitle>
          </CardHeader>
          <CardContent>
            {groupChats.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No group chats yet
              </p>
            ) : (
              <div className="space-y-3">
                {groupChats.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-dna-emerald text-white text-xs">
                        {group.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dna-forest truncate">
                        {group.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {group.members} members • {group.lastActive}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-dna-forest">Conversation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="ghost" className="w-full justify-start">
            <Star className="h-4 w-4 mr-2" />
            Star this conversation
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Archive className="h-4 w-4 mr-2" />
            Archive conversation
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Conversation settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-dna-forest">Shared Files</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">
            No files shared yet
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessageSidebar;