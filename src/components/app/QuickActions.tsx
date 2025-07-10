import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users, Building, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const QuickActions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const actions = [
    {
      id: 'create-post',
      label: 'Create Post',
      icon: PlusCircle,
      color: 'text-dna-emerald',
      action: () => {
        // Scroll to top of feed where post composer is
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast({
          title: 'Ready to post!',
          description: 'Share your thoughts with the DNA community.',
        });
      }
    },
    {
      id: 'find-connections',
      label: 'Find Connections',
      icon: Users,
      color: 'text-dna-copper',
      action: () => {
        navigate('/app/network');
        toast({
          title: 'Explore connections',
          description: 'Discover professionals in your network.',
        });
      }
    },
    {
      id: 'join-community',
      label: 'Join Community',
      icon: Building,
      color: 'text-dna-forest',
      action: () => {
        toast({
          title: 'Communities coming soon!',
          description: 'Community features will be available soon.',
        });
      }
    },
    {
      id: 'start-conversation',
      label: 'Start Conversation',
      icon: MessageCircle,
      color: 'text-dna-gold',
      action: () => {
        toast({
          title: 'Messaging coming soon!',
          description: 'Direct messaging will be available soon.',
        });
      }
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              variant="ghost"
              className={`w-full justify-start h-9 ${action.color} hover:bg-gray-50`}
              onClick={action.action}
            >
              <Icon className="h-4 w-4 mr-3" />
              {action.label}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default QuickActions;