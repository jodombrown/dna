
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
  Sparkles
} from 'lucide-react';

const ComingSoon = () => {
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

  const features = [
    "Professional networking with verified African diaspora",
    "Innovation pathway collaboration and funding",
    "Mentorship and professional development programs",
    "Real-time project management and impact tracking",
    "Global events and community building",
    "Expert services marketplace"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-forest via-dna-emerald to-dna-copper">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Main content */}
      <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center text-white">
          
          {/* Header */}
          <div className="mb-8">
            <Badge className="bg-dna-gold text-dna-forest mb-6 text-lg font-bold px-6 py-2">
              Coming Soon
            </Badge>
            
            <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
              The Future of
              <br />
              <span className="text-dna-gold">African Diaspora</span>
              <br />
              Connection
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto leading-relaxed">
              Join the world's most powerful network of African diaspora professionals. 
              Connect, collaborate, and contribute to Africa's transformation like never before.
            </p>
          </div>

          {/* Email signup */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-12 max-w-md mx-auto">
            <CardContent className="p-8">
              {!isSubscribed ? (
                <>
                  <h3 className="text-xl font-semibold mb-4 text-white">
                    Be the First to Know
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
                      Notify Me
                    </Button>
                  </div>
                  <p className="text-sm text-gray-300 mt-3">
                    Get exclusive early access and launch updates
                  </p>
                </>
              ) : (
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-dna-gold mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-white">
                    You're on the list!
                  </h3>
                  <p className="text-gray-300">
                    We'll notify you when DNA Platform launches
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

          {/* Features preview */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-12">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6">
                What's Coming
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center text-left">
                    <CheckCircle className="w-5 h-5 text-dna-gold mr-3 flex-shrink-0" />
                    <span className="text-gray-200">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Call to action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-dna-copper hover:bg-dna-gold text-white text-lg px-8 py-4"
            >
              <Mail className="w-5 h-5 mr-2" />
              Get Updates
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-dna-forest text-lg px-8 py-4"
            >
              Learn More
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Footer note */}
          <div className="mt-12 text-gray-300 text-sm">
            <p>Building the future of African diaspora collaboration</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
