import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Users, MessageCircle, Calendar } from 'lucide-react';

const NewExperienceHome = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-mint/5 via-white to-dna-copper/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-dna-copper mr-3" />
              <h1 className="text-4xl md:text-6xl font-bold text-dna-forest">
                Welcome to DNA v2
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              A reimagined experience for the African Diaspora Network. 
              Connect, collaborate, and contribute in entirely new ways.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-dna-copper hover:bg-dna-copper/90"
                onClick={() => navigate('/app/explore')}
              >
                Explore New Experience
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/dashboard-v1')}
              >
                Access Classic Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-dna-mint/20 hover:border-dna-mint/40 transition-colors">
            <CardHeader>
              <Users className="w-8 h-8 text-dna-mint mb-2" />
              <CardTitle className="text-dna-forest">Smart Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                AI-powered matching based on impact goals, skills, and regional focus.
              </p>
            </CardContent>
          </Card>

          <Card className="border-dna-emerald/20 hover:border-dna-emerald/40 transition-colors">
            <CardHeader>
              <MessageCircle className="w-8 h-8 text-dna-emerald mb-2" />
              <CardTitle className="text-dna-forest">Impact Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Purpose-driven discussions organized around real-world challenges.
              </p>
            </CardContent>
          </Card>

          <Card className="border-dna-copper/20 hover:border-dna-copper/40 transition-colors">
            <CardHeader>
              <Calendar className="w-8 h-8 text-dna-copper mb-2" />
              <CardTitle className="text-dna-forest">Collaborative Action</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Project-based collaboration with measurable impact tracking.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Update */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-dna-forest mb-2">
              Development Status
            </h3>
            <p className="text-gray-600">
              New experience architecture in progress. Your classic dashboard remains fully functional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewExperienceHome;