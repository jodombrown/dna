
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/CleanAuthContext';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MessageCircle, Heart, Share2 } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

const SocialFeed = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const mockPosts = [
    {
      id: 1,
      author: "Amara Okafor",
      role: "Tech Entrepreneur",
      location: "Lagos, Nigeria → London, UK",
      content: "Just launched our fintech startup connecting African SMEs with global investors. The diaspora's purchasing power is incredible - $200B annually! Who's ready to build together? 🚀",
      likes: 24,
      comments: 8,
      shares: 3,
      timestamp: "2 hours ago"
    },
    {
      id: 2,
      author: "Dr. Kwame Asante",
      role: "Healthcare Innovation",
      location: "Accra, Ghana → Toronto, Canada",
      content: "Telemedicine is transforming healthcare access across Africa. Our platform has connected 10,000+ patients with diaspora doctors. Impact beyond borders! 🏥",
      likes: 18,
      comments: 12,
      shares: 5,
      timestamp: "4 hours ago"
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-dna-forest mb-2">
              Welcome to Your DNA Feed, {profile?.display_name || profile?.full_name}
            </h1>
            <p className="text-gray-600">
              Connect, collaborate, and contribute with the African diaspora community
            </p>
          </div>

          <div className="space-y-6">
            {mockPosts.map((post) => (
              <Card key={post.id} className="shadow-sm">
                <CardHeader>
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-dna-emerald rounded-full flex items-center justify-center text-white font-semibold">
                      {post.author.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-dna-forest">{post.author}</h3>
                      <p className="text-sm text-gray-600">{post.role}</p>
                      <p className="text-xs text-gray-500">{post.location} • {post.timestamp}</p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-800 mb-4">{post.content}</p>
                  
                  <div className="flex items-center space-x-6 text-gray-500">
                    <button className="flex items-center space-x-2 hover:text-dna-copper transition-colors">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-2 hover:text-dna-copper transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{post.comments}</span>
                    </button>
                    <button className="flex items-center space-x-2 hover:text-dna-copper transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">{post.shares}</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Card className="bg-dna-mint/10 border-dna-mint">
              <CardContent className="py-8">
                <Users className="w-12 h-12 text-dna-emerald mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-dna-forest mb-2">
                  This is just the beginning
                </h3>
                <p className="text-gray-600 mb-4">
                  Connect with thousands of African diaspora professionals across the globe
                </p>
                <Button 
                  onClick={() => navigate('/connect')}
                  className="bg-dna-emerald hover:bg-dna-forest text-white"
                >
                  Explore Network
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SocialFeed;
