
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Zap, Shield, Globe, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CompetitiveEdgeSection = () => {
  const navigate = useNavigate();

  const differentiators = [
    {
      icon: Target,
      title: "Purpose-Driven Matching",
      description: "Unlike generic networking, we connect you based on shared impact goals and complementary expertise for African development.",
      comparison: "vs. LinkedIn's broad networking"
    },
    {
      icon: Zap,
      title: "Project-Centric Collaboration",
      description: "Move beyond conversations to coordinated action. Our platform facilitates actual venture building and ecosystem development.",
      comparison: "vs. AngelList's deal focus only"
    },
    {
      icon: Shield,
      title: "Diaspora-First Design",
      description: "Built specifically for the unique challenges and opportunities of African diaspora professionals across multiple continents.",
      comparison: "vs. Generic global platforms"
    }
  ];

  const uniqueFeatures = [
    "Smart matching based on impact alignment",
    "Integrated due diligence and collaboration tools", 
    "Cross-continental project coordination",
    "Cultural context and diaspora-specific insights",
    "Built-in capacity building and mentorship"
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <Badge className="bg-dna-copper/10 text-dna-copper border-dna-copper/20 mb-4">
            <Globe className="w-4 h-4 mr-2" />
            The DNA Difference
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Why DNA Is Different from Every Other Platform
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're not just another networking platform. DNA is the first ecosystem designed specifically to transform diaspora connections into coordinated African development.
          </p>
        </div>

        {/* Key Differentiators */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {differentiators.map((diff, index) => (
            <Card key={index} className="hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-dna-emerald">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-dna-emerald/10 rounded-lg flex items-center justify-center">
                    <diff.icon className="w-6 h-6 text-dna-emerald" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{diff.title}</h3>
                </div>
                <p className="text-gray-700 mb-4">{diff.description}</p>
                <Badge variant="outline" className="text-dna-copper border-dna-copper/20">
                  {diff.comparison}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Unique Features Grid */}
        <div className="bg-gradient-to-br from-dna-mint/10 to-dna-emerald/10 rounded-2xl p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                What You Can't Get Anywhere Else
              </h3>
              <div className="space-y-4">
                {uniqueFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-dna-emerald flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => navigate('/connect-example')}
                  className="bg-dna-emerald hover:bg-dna-forest"
                >
                  Experience the Difference
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/about')}
                  className="border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white"
                >
                  Learn Our Approach
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h4 className="font-semibold text-gray-900 mb-4">Platform Comparison</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">LinkedIn</span>
                    <span className="text-sm text-gray-500">General networking</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">AngelList</span>
                    <span className="text-sm text-gray-500">Startup focused</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Other diaspora groups</span>
                    <span className="text-sm text-gray-500">Social only</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="font-semibold text-dna-emerald">DNA Platform</span>
                    <span className="text-sm font-medium text-dna-emerald">Impact-driven ecosystem</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompetitiveEdgeSection;
