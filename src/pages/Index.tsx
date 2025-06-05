
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  Users, 
  TrendingUp, 
  Heart,
  ArrowRight,
  Mail,
  Bell,
  CheckCircle,
  Sparkles,
  MessageSquare,
  Lightbulb,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Index = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (email) {
      setIsSubscribed(true);
      // Here you would integrate with your email service
      console.log('Subscribed:', email);
    }
  };

  const impactNumbers = [
    { value: "500K+", label: "Diaspora Professionals Ready", icon: <Users className="w-6 h-6" /> },
    { value: "54", label: "African Countries Connected", icon: <Globe className="w-6 h-6" /> },
    { value: "Q2 2025", label: "Official Launch", icon: <Sparkles className="w-6 h-6" /> },
    { value: "$2.5B+", label: "Impact Potential", icon: <TrendingUp className="w-6 h-6" /> }
  ];

  const buildingTogether = [
    {
      title: "Community-Driven Development",
      description: "We're building this platform WITH the African diaspora community, not just FOR them",
      icon: <Users className="w-8 h-8 text-dna-copper" />
    },
    {
      title: "Continuous Feedback Loop",
      description: "Your insights shape our features. Every voice matters in creating the future of diaspora connection",
      icon: <MessageSquare className="w-8 h-8 text-dna-emerald" />
    },
    {
      title: "Innovation Through Collaboration",
      description: "Together we're creating tools that will transform how the African diaspora connects and contributes",
      icon: <Lightbulb className="w-8 h-8 text-dna-gold" />
    }
  ];

  const features = [
    "Professional networking with verified African diaspora",
    "Innovation pathway collaboration and funding",
    "Mentorship and professional development programs",
    "Real-time project management and impact tracking",
    "Global events and community building",
    "Expert services marketplace"
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-dna-forest via-dna-emerald to-dna-copper text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Header */}
            <div className="mb-8">
              <Badge className="bg-dna-gold text-dna-forest mb-6 text-lg font-bold px-6 py-2">
                Building Together
              </Badge>
              
              <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
                The Future of
                <br />
                <span className="text-dna-gold">African Diaspora</span>
                <br />
                Connection
              </h1>
              
              <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto leading-relaxed">
                Join us in building the world's most powerful network of African diaspora professionals. 
                We're not just creating a platform - we're building a movement, together with you.
              </p>
            </div>

            {/* Email signup */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-12 max-w-md mx-auto">
              <CardContent className="p-8">
                {!isSubscribed ? (
                  <>
                    <h3 className="text-xl font-semibold mb-4 text-white">
                      Join Our Building Community
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                      />
                      <Button 
                        onClick={handleSubscribe}
                        className="bg-dna-copper hover:bg-dna-gold text-white"
                      >
                        <Bell className="w-4 h-4 mr-2" />
                        Join Us
                      </Button>
                    </div>
                    <p className="text-sm text-gray-300 mt-3">
                      Get early access, share feedback, and help shape the platform
                    </p>
                  </>
                ) : (
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 text-dna-gold mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-white">
                      Welcome to the Movement!
                    </h3>
                    <p className="text-gray-300">
                      We'll keep you updated and invite you to help build with us
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Impact stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {impactNumbers.map((stat, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-dna-gold mb-2">
                      {stat.icon}
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-200">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Call to action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-dna-copper hover:bg-dna-gold text-white text-lg px-8 py-4"
                onClick={() => navigate('/auth')}
              >
                <Target className="w-5 h-5 mr-2" />
                Start Building With Us
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-dna-forest text-lg px-8 py-4"
                onClick={() => navigate('/dashboard')}
              >
                Explore Our Vision
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Building Together Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why We're <span className="text-dna-copper">Building Together</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The African diaspora has incredible potential. But scattered across the globe, 
              our collective power remains untapped. We're changing that - with your help.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {buildingTogether.map((item, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What We're Building */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What We're <span className="text-dna-emerald">Building</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive platform that connects, empowers, and amplifies the African diaspora's impact on the continent
            </p>
          </div>

          <Card className="bg-white/90 backdrop-blur-sm border-gray-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-dna-forest mb-6 text-center">
                Platform Features Coming Soon
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center text-left">
                    <CheckCircle className="w-5 h-5 text-dna-gold mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Community Call to Action */}
      <section className="py-20 bg-gradient-to-r from-dna-forest to-dna-emerald text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Build Africa's Future?
          </h2>
          <p className="text-xl mb-8 text-gray-100">
            This isn't just about joining a network - it's about creating the infrastructure 
            for African diaspora impact. Your expertise, our platform, Africa's transformation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              className="bg-dna-copper hover:bg-dna-gold text-white text-lg px-8 py-4"
              onClick={() => navigate('/auth')}
            >
              <Heart className="w-5 h-5 mr-2" />
              Join the Movement
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-dna-forest text-lg px-8 py-4"
              onClick={() => setEmail('')}
            >
              <Mail className="w-5 h-5 mr-2" />
              Share Your Ideas
            </Button>
          </div>
          
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center text-gray-200">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Free to Join</span>
            </div>
            <div className="flex items-center text-gray-200">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Community-Driven</span>
            </div>
            <div className="flex items-center text-gray-200">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Building Together</span>
            </div>
            <div className="flex items-center text-gray-200">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Africa-Focused</span>
            </div>
          </div>

          <div className="mt-12 text-gray-300 text-sm">
            <p>Building the future of African diaspora collaboration - one connection at a time</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
