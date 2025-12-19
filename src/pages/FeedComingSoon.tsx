import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageSquare, TrendingUp, Users } from 'lucide-react';
import FeedResearchForm from '@/components/feed/FeedResearchForm';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const FeedComingSoon = () => {
  const { user } = useAuth();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkExistingResponse = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('feed_research_responses')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setHasSubmitted(true);
      }
      setIsLoading(false);
    };

    checkExistingResponse();
  }, [user]);

  const features = [
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Share Your Journey",
      description: "Post career updates, business launches, and professional milestones to your network"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Build Your Brand",
      description: "Establish thought leadership and amplify your impact across the diaspora"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Stay Connected",
      description: "See what your connections are building and discover opportunities in real-time"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-forest/5 via-white to-dna-emerald/5">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-dna-gold/10 text-dna-copper px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="font-semibold">Coming Soon</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-dna-forest mb-4">
            DNA | FEED
          </h1>
          
          <p className="text-xl md:text-2xl text-dna-emerald font-semibold mb-4">
            Your Professional Voice in the Diaspora Network
          </p>
          
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            The feed is where you'll share your journey, amplify opportunities, and stay 
            connected to what the diaspora is building - all in one place.
          </p>
        </div>

        {/* Feature Preview Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-dna-emerald mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-dna-forest mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Research Form Section */}
        {!isLoading && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-dna-forest mb-2">
                Help Us Build the Right Feed for You
              </h2>
              <p className="text-lg text-gray-600">
                Your input shapes what we build. Take 2 minutes to share your thoughts.
              </p>
            </div>

            {hasSubmitted ? (
              <Card className="p-8 text-center bg-dna-emerald/5 border-dna-emerald">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-dna-forest mb-2">
                  Thank You!
                </h3>
                <p className="text-gray-700">
                  You've already shared your feedback. Your input is helping us build DNA for the diaspora.
                </p>
              </Card>
            ) : (
              <FeedResearchForm onSuccess={() => setHasSubmitted(true)} />
            )}
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center">
          <Card className="p-8 bg-gradient-to-r from-dna-forest to-dna-emerald text-white">
            <h3 className="text-2xl font-bold mb-2">
              Be Among the First to Post
            </h3>
            <p className="text-lg mb-6 opacity-90">
              We'll notify you when the feed launches. Join the community shaping Africa's future.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-dna-forest hover:bg-gray-100 font-bold"
              onClick={() => {
                const formSection = document.getElementById('research-form');
                formSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Share Your Input
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FeedComingSoon;
