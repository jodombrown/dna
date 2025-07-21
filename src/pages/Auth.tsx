
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, Handshake, Heart } from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const Auth = () => {
  useScrollToTop();
  
  const navigate = useNavigate();
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="absolute top-4 left-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <CardTitle className="text-2xl font-bold text-dna-forest mb-2">
              Join the DNA Network
            </CardTitle>
            <p className="text-gray-600">
              Connect with Africa's diaspora community
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="bg-dna-mint/20 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-dna-forest mb-3">Platform Coming Soon</h3>
                <p className="text-sm text-gray-600 mb-4">
                  We're building the future of diaspora engagement. Be the first to know when we launch!
                </p>
                
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <div className="flex items-center gap-2 text-dna-emerald">
                    <Users className="w-4 h-4" />
                    <span className="text-xs">Connect</span>
                  </div>
                  <div className="flex items-center gap-2 text-dna-copper">
                    <Handshake className="w-4 h-4" />
                    <span className="text-xs">Collaborate</span>
                  </div>
                  <div className="flex items-center gap-2 text-dna-forest">
                    <Heart className="w-4 h-4" />
                    <span className="text-xs">Contribute</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => setShowDemo(!showDemo)}
                  className="w-full bg-dna-emerald hover:bg-dna-forest text-white"
                >
                  {showDemo ? 'Hide Demo' : 'Preview Platform Features'}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => navigate('/clean-social-feed')}
                  className="w-full border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white"
                >
                  View Demo Feed
                </Button>
              </div>

              {showDemo && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
                  <h4 className="font-semibold text-sm text-gray-900 mb-3">Platform Features:</h4>
                  <ul className="text-xs text-gray-600 space-y-2">
                    <li>• Professional networking for diaspora members</li>
                    <li>• Community-driven collaboration spaces</li>
                    <li>• Investment and contribution opportunities</li>
                    <li>• Real-time impact tracking</li>
                    <li>• Cultural exchange and mentorship</li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
