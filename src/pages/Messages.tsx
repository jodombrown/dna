
import React from 'react';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Your Messages
          </h1>
          <p className="text-gray-600 mb-6">
            Sign in to view your messages and connect with diaspora professionals worldwide.
          </p>
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-dna-emerald hover:bg-dna-forest text-white"
          >
            Sign In to Continue
          </Button>
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
        
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <MessageSquare className="w-16 h-16 text-dna-emerald mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Messaging System Coming Soon
          </h2>
          <p className="text-gray-600 mb-6">
            We're building a powerful messaging system to help you connect with other diaspora professionals. 
            This feature will be available in a future update.
          </p>
          <Button 
            onClick={() => navigate('/clean-social-feed')}
            className="bg-dna-emerald hover:bg-dna-forest text-white"
          >
            Explore Community Feed
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Messages;
