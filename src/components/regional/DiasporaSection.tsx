import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, TrendingUp, Users, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import diasporaImage from '@/assets/diaspora-connection.jpg';

interface DiasporaSectionProps {
  region: string;
}

const DiasporaSection: React.FC<DiasporaSectionProps> = ({ region }) => {
  const [diasporaStories, setDiasporaStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiasporaData();
  }, [region]);

  const fetchDiasporaData = async () => {
    try {
      const { data, error } = await supabase
        .from('diaspora_data')
        .select(`
          *,
          countries (name, iso_code)
        `)
        .eq('featured', true)
        .limit(6);

      if (!error && data) {
        setDiasporaStories(data);
      }
    } catch (error) {
      console.error('Error fetching diaspora data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const mockStories = [
    {
      story_title: "Tech Hub Investment in Cairo",
      diaspora_name: "Ahmed Hassan",
      diaspora_location: "Silicon Valley, USA",
      story_content: "Egyptian-American entrepreneur invests $2M in Cairo's first AI-focused startup accelerator, bridging Silicon Valley expertise with local talent.",
      project_type: "investment",
      remittance_value: 2000000,
      countries: { name: "Egypt", iso_code: "EG" }
    },
    {
      story_title: "Educational Initiative in Morocco",
      diaspora_name: "Fatima Al-Zahra",
      diaspora_location: "Paris, France",
      story_content: "Moroccan entrepreneur in Paris launches coding bootcamp program for young women in Casablanca, training 500+ developers.",
      project_type: "social_impact",
      countries: { name: "Morocco", iso_code: "MA" }
    },
    {
      story_title: "Agricultural Innovation Fund",
      diaspora_name: "Omar Ben Ali",
      diaspora_location: "Toronto, Canada",
      story_content: "Tunisian-Canadian agricultural engineer creates sustainable farming solutions, helping 1,000+ small farmers increase yields by 40%.",
      project_type: "social_impact",
      countries: { name: "Tunisia", iso_code: "TN" }
    }
  ];

  const remittanceStats = [
    { country: "Egypt", amount: "$24.4B", growth: "+8.2%" },
    { country: "Morocco", amount: "$7.4B", growth: "+12.1%" },
    { country: "Tunisia", amount: "$1.9B", growth: "+5.3%" },
    { country: "Algeria", amount: "$2.1B", growth: "+3.7%" }
  ];

  const stories = diasporaStories.length > 0 ? diasporaStories : mockStories;

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-dna-mint/10 to-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-dna-emerald text-dna-emerald">
            <Heart className="h-3 w-3 mr-1" />
            Diaspora Impact
          </Badge>
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-dna-forest to-dna-emerald bg-clip-text text-transparent">
            {region} Diaspora Network
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Stories of connection, investment, and transformation from {region} diaspora communities worldwide.
          </p>
          
          {/* Hero Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl max-w-4xl mx-auto mb-12">
            <img 
              src={diasporaImage} 
              alt="North Africa Diaspora Connection" 
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dna-forest/70 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-lg font-semibold">Global Network</h3>
              <p className="text-sm opacity-90">Connecting Africa to the world through innovation</p>
            </div>
          </div>
        </div>

        {/* Remittance Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {remittanceStats.map((stat, index) => (
            <Card key={index} className="text-center bg-gradient-to-br from-white to-dna-mint/10 border-dna-emerald/20 hover:shadow-lg transition-all duration-300 group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-dna-emerald to-dna-copper" />
              <CardContent className="p-6">
                <TrendingUp className="h-8 w-8 text-dna-emerald mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold mb-1 text-dna-forest">{stat.country}</h3>
                <p className="text-2xl font-bold text-dna-emerald mb-1">{stat.amount}</p>
                <Badge variant="secondary" className="text-xs bg-dna-forest text-white">
                  {stat.growth} YoY
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">Remittances 2024</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Success Stories */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold">Success Stories</h3>
            <Button variant="outline" className="group">
              View All Stories
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-north-africa-sand/10 border-dna-emerald/20 hover:border-dna-emerald/40">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-dna-copper to-dna-emerald" />
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs border-dna-copper text-dna-copper">
                      {story.project_type || 'Impact Story'}
                    </Badge>
                    <Heart className="h-4 w-4 text-muted-foreground group-hover:text-dna-emerald transition-colors" />
                  </div>
                  <CardTitle className="text-lg line-clamp-2 text-dna-forest group-hover:text-dna-emerald transition-colors">
                    {story.story_title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{story.diaspora_name}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{story.diaspora_location}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {story.story_content}
                  </p>
                  {story.remittance_value && (
                    <div className="pt-3 border-t">
                      <p className="text-sm font-semibold">
                        Investment: ${(story.remittance_value / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Engagement CTA */}
        <Card className="bg-gradient-to-r from-dna-emerald/10 via-dna-mint/20 to-dna-copper/10 border-dna-emerald/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-dna-emerald/5 to-dna-copper/5" />
          <CardContent className="p-8 text-center relative z-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-dna-forest to-dna-emerald bg-clip-text text-transparent">
                Join the Diaspora Network
              </h3>
            </div>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Connect with fellow diaspora members, discover investment opportunities, 
              and contribute to {region}'s sustainable development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="group bg-dna-emerald hover:bg-dna-emerald/90 text-white">
                Share Your Story
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg" className="border-dna-copper text-dna-copper hover:bg-dna-copper/10">
                Explore Opportunities
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default DiasporaSection;