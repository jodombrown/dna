
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  Users, 
  TrendingUp, 
  Heart,
  ArrowRight,
  MapPin,
  Briefcase,
  GraduationCap,
  Target,
  Star,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Index = () => {
  const navigate = useNavigate();

  const impactStats = [
    { label: "Diaspora Professionals", value: "500K+", icon: <Users className="w-6 h-6" /> },
    { label: "Active Projects", value: "1,200+", icon: <Target className="w-6 h-6" /> },
    { label: "African Countries", value: "54", icon: <Globe className="w-6 h-6" /> },
    { label: "Impact Generated", value: "$2.5B+", icon: <TrendingUp className="w-6 h-6" /> }
  ];

  const features = [
    {
      title: "Professional Network",
      description: "Connect with 500,000+ African diaspora professionals across the globe",
      icon: <Users className="w-8 h-8 text-dna-copper" />,
      action: () => navigate('/members')
    },
    {
      title: "Innovation Pathways",
      description: "Discover and support groundbreaking projects transforming Africa",
      icon: <Target className="w-8 h-8 text-dna-emerald" />,
      action: () => navigate('/#pathways')
    },
    {
      title: "Professional Development",
      description: "Access world-class programs, events, and resources for growth",
      icon: <GraduationCap className="w-8 h-8 text-dna-gold" />,
      action: () => navigate('/programs')
    },
    {
      title: "Expert Services",
      description: "Get professional guidance from experienced diaspora consultants",
      icon: <Briefcase className="w-8 h-8 text-dna-mint" />,
      action: () => navigate('/services')
    }
  ];

  const testimonials = [
    {
      name: "Dr. Amara Okafor",
      title: "Tech Entrepreneur, Nigeria",
      content: "DNA connected me with diaspora investors who understood my vision. We raised $2M for our AgriTech startup.",
      avatar: "AO",
      rating: 5
    },
    {
      name: "Sarah Mwangi",
      title: "Investment Analyst, London",
      content: "The quality of projects and professionals on DNA is unmatched. It's become my go-to platform for African investments.",
      avatar: "SM",
      rating: 5
    },
    {
      name: "Jaûne Odombrown",
      title: "Consultant, New York",
      content: "Through DNA's programs, I've been able to mentor over 50 African entrepreneurs and make real impact.",
      avatar: "MA",
      rating: 5
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: rating }, (_, i) => (
      <Star key={i} className="w-4 h-4 text-dna-gold fill-current" />
    ));
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-dna-forest via-dna-emerald to-dna-copper text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <Badge className="bg-dna-gold text-dna-forest mb-6 text-sm font-semibold">
                Welcome to the DNA Platform
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Connecting Africa's 
                <span className="text-dna-gold"> Global Diaspora</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-gray-100 leading-relaxed">
                Join the world's largest network of African diaspora professionals. 
                Connect, collaborate, and contribute to Africa's transformation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  size="lg" 
                  className="bg-dna-copper hover:bg-dna-gold text-white text-lg px-8 py-4"
                  onClick={() => navigate('/auth')}
                >
                  Join the Network
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-dna-forest text-lg px-8 py-4"
                  onClick={() => navigate('/dashboard')}
                >
                  Explore DNA Platform
                </Button>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {impactStats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-dna-gold">{stat.value}</div>
                    <div className="text-sm text-gray-200">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="p-6">
                      <Globe className="w-12 h-12 text-dna-gold mb-4" />
                      <h3 className="font-semibold mb-2 text-white">Global Reach</h3>
                      <p className="text-sm text-gray-200">Professionals in 100+ countries</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="p-6">
                      <Heart className="w-12 h-12 text-dna-copper mb-4" />
                      <h3 className="font-semibold mb-2 text-white">Purposeful Impact</h3>
                      <p className="text-sm text-gray-200">Driving sustainable change</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-6 mt-8">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="p-6">
                      <TrendingUp className="w-12 h-12 text-dna-emerald mb-4" />
                      <h3 className="font-semibold mb-2 text-white">Growth Focus</h3>
                      <p className="text-sm text-gray-200">Accelerating African innovation</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="p-6">
                      <Users className="w-12 h-12 text-dna-mint mb-4" />
                      <h3 className="font-semibold mb-2 text-white">Community First</h3>
                      <p className="text-sm text-gray-200">Building lasting connections</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose <span className="text-dna-copper">DNA Platform?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're more than a network - we're a movement of African diaspora professionals 
              committed to transforming the continent through collaboration and innovation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={feature.action}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                  <ArrowRight className="w-5 h-5 text-dna-copper mx-auto mt-4 group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Success <span className="text-dna-emerald">Stories</span>
            </h2>
            <p className="text-xl text-gray-600">
              Real impact from real professionals making a difference
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {renderStars(testimonial.rating)}
                  </div>
                  <p className="text-gray-700 mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-dna-copper rounded-full flex items-center justify-center text-white font-semibold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.title}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-dna-forest to-dna-emerald text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Make Your Impact?
          </h2>
          <p className="text-xl mb-8 text-gray-100">
            Join thousands of African diaspora professionals who are already transforming the continent. 
            Your expertise, our network, Africa's future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-dna-copper hover:bg-dna-gold text-white text-lg px-8 py-4"
              onClick={() => navigate('/auth')}
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-dna-forest text-lg px-8 py-4"
              onClick={() => navigate('/dashboard')}
            >
              Explore Platform
            </Button>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-8">
            <div className="flex items-center text-gray-200">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Free to Join</span>
            </div>
            <div className="flex items-center text-gray-200">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Verified Professionals</span>
            </div>
            <div className="flex items-center text-gray-200">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Global Network</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
