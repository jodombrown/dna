import React from 'react';
import { Megaphone, Share2, TrendingUp, Globe, Users, BarChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import UnifiedHeader from '@/components/UnifiedHeader';
import Footer from '@/components/Footer';

const ConveyExample = () => {
  const impactStories = [
    {
      title: 'Solar Energy Revolution in Rwanda',
      author: 'Dr. Amara Okafor',
      reach: '2.5M',
      engagement: '45K',
      category: 'Energy',
      impact: 'Inspired 12 new solar projects'
    },
    {
      title: 'EdTech Transforming Ghana Schools',
      author: 'Prof. Kwame Asante',
      reach: '1.8M',
      engagement: '32K',
      category: 'Education',
      impact: '500 schools adopted platform'
    },
    {
      title: 'AgriTech Innovation in Kenya',
      author: 'Sarah Wanjiru',
      reach: '3.2M',
      engagement: '58K',
      category: 'Agriculture',
      impact: '10,000 farmers benefited'
    }
  ];

  const features = [
    {
      icon: Megaphone,
      title: 'Amplify Impact',
      description: 'Share your success stories and innovations with the global diaspora'
    },
    {
      icon: Share2,
      title: 'Cross-Platform Reach',
      description: 'Distribute your message across multiple channels and communities'
    },
    {
      icon: TrendingUp,
      title: 'Track Engagement',
      description: 'Measure the reach and impact of your shared content'
    },
    {
      icon: Globe,
      title: 'Global Visibility',
      description: 'Connect with diaspora communities worldwide'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <UnifiedHeader />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-dna-copper text-white">
              Convey
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-dna-forest via-dna-emerald to-dna-copper bg-clip-text text-transparent">
              Share. Inspire. Transform.
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Amplify Africa's success stories, innovations, and impact across the global diaspora. 
              Your story can inspire thousands and catalyze change.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="border-dna-copper/20 hover:border-dna-copper/40 transition-all">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 bg-dna-copper/10 rounded-lg mb-4">
                      <feature.icon className="h-6 w-6 text-dna-copper" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Impact Stories */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Trending Impact Stories</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {impactStories.map((story, index) => (
                <Card key={index} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary" className="bg-dna-forest text-white">
                        {story.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{story.title}</CardTitle>
                    <CardDescription className="text-sm">by {story.author}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-dna-copper">{story.reach}</div>
                          <div className="text-xs text-muted-foreground">People Reached</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-dna-emerald">{story.engagement}</div>
                          <div className="text-xs text-muted-foreground">Engagements</div>
                        </div>
                      </div>
                      <div className="p-3 bg-dna-emerald/10 rounded-lg">
                        <p className="text-sm font-medium text-dna-forest">{story.impact}</p>
                      </div>
                      <Button className="w-full mt-4 bg-dna-copper hover:bg-dna-copper/90">
                        Read Full Story
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <Card className="mb-16 border-dna-copper/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Community Impact</CardTitle>
              <CardDescription>Stories shared across the diaspora network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-dna-copper mb-2">12.5M+</div>
                  <div className="text-sm text-muted-foreground">Total Reach</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-dna-emerald mb-2">847</div>
                  <div className="text-sm text-muted-foreground">Stories Shared</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-dna-forest mb-2">250K+</div>
                  <div className="text-sm text-muted-foreground">Engagements</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-dna-forest to-dna-copper text-white border-0">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to share your impact story?</h3>
              <p className="mb-6 text-white/90">
                Inspire the diaspora with your innovations, successes, and the change you're creating in Africa.
              </p>
              <Button variant="secondary" size="lg" className="bg-white text-dna-forest hover:bg-white/90">
                Share Your Story
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ConveyExample;
