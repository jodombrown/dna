
import React from 'react';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Send } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md">
          <EmptyState
            icon={MessageSquare}
            title="Access Your Messages"
            description="Sign in to view your messages and connect with diaspora professionals worldwide."
            actionLabel="Sign In to Continue"
            onAction={() => navigate('/auth')}
            size="lg"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">
            Connect and communicate with diaspora professionals
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <EmptyState
            icon={Users}
            title="Messaging System Coming Soon"
            description="We're building a powerful messaging system to help you connect with other diaspora professionals. This feature will be available in a future update."
            actionLabel="Explore Community Feed"
            onAction={() => navigate('/clean-social-feed')}
            size="lg"
          />
        </div>
      </div>
    </div>
  );
};

export default Messages;
