import React from "react";
import Header from "@/components/Header";
import PrototypeBanner from "@/components/PrototypeBanner";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  DollarSign, 
  Clock, 
  Brain, 
  Users, 
  TrendingUp,
  Target,
  Globe,
  Award,
  Handshake,
  ArrowLeft,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useScrollToTop } from '@/hooks/useScrollToTop';

const Contribute = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const contributionMethods = [
    {
      icon: DollarSign,
      title: "Financial Contributions",
      description: "Support diaspora initiatives through direct funding, micro-investments, or sponsorship programs",
      impact: "Fund 5+ projects monthly",
      color: "dna-gold",
      examples: ["Project funding", "Scholarship programs", "Startup investments", "Community grants"]
    },
    {
      icon: Clock,
      title: "Time & Skills",
      description: "Volunteer your expertise, mentor emerging leaders, or contribute to community projects",
      impact: "200+ volunteer hours weekly",
      color: "dna-emerald",
      examples: ["Mentorship programs", "Pro bono consulting", "Skill workshops", "Project collaboration"]
    },
    {
      icon: Brain,
      title: "Knowledge Sharing",
      description: "Share insights, research, best practices, and cultural knowledge with the community",
      impact: "1000+ resources shared",
      color: "dna-copper",
      examples: ["Research publications", "Industry insights", "Cultural preservation", "Educational content"]
    },
    {
      icon: Users,
      title: "Network Building",
      description: "Connect professionals, facilitate introductions, and strengthen diaspora networks",
      impact: "500+ connections made",
      color: "dna-coral",
      examples: ["Professional introductions", "Partnership facilitation", "Community events", "Cross-border collaboration"]
    }
  ];

  const impactAreas = [
    { area: "Education", projects: 15, funding: "$250K" },
    { area: "Healthcare", projects: 8, funding: "$180K" },
    { area: "Technology", projects: 22, funding: "$420K" },
    { area: "Agriculture", projects: 12, funding: "$310K" },
    { area: "Arts & Culture", projects: 18, funding: "$160K" },
    { area: "Economic Development", projects: 25, funding: "$650K" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <PrototypeBanner />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pillar navigation */}
        <div className="flex items-center justify-between px-4 py-3">
          <button
            className="flex items-center gap-2 text-dna-emerald font-semibold hover:underline bg-white rounded shadow px-3 py-1"
            onClick={() => navigate("/connect")}
          >
            <ArrowLeft className="w-5 h-5" /> Connect
          </button>
          <button
            className="flex items-center gap-2 text-dna-copper font-semibold hover:underline bg-white rounded shadow px-3 py-1"
            onClick={() => navigate("/collaborate")}
          >
            Collaborate <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-dna-forest to-dna-emerald text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Contribute to Global Impact
              </h1>
              <p className="text-xl md:text-2xl text-dna-mint/90 mb-8 max-w-4xl mx-auto">
                Your contributions—whether financial, time, skills, or knowledge—power transformative 
                projects across the African diaspora community
              </p>
              <div className="flex flex-wrap justify-center gap-8 text-lg mb-8">
                <div className="flex items-center gap-2">
                  <Target className="w-6 h-6" />
                  <span>100+ Active Projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-6 h-6" />
                  <span>$2M+ Community Invested</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  <span>5,000+ Lives Impacted</span>
                </div>
              </div>
              <Button size="lg" className="bg-dna-gold hover:bg-dna-copper text-dna-forest font-semibold px-8 py-4 text-lg">
                Start Contributing Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Contribution Methods */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-dna-forest mb-4">
                Ways to Make an Impact
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Choose how you'd like to contribute to diaspora initiatives and community development
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {contributionMethods.map((method, index) => {
                const IconComponent = method.icon;
                return (
                  <Card key={index} className={`border-2 border-${method.color}/20 hover:border-${method.color}/40 transition-all duration-300 hover:shadow-lg`}>
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 bg-${method.color} rounded-full flex items-center justify-center`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-dna-forest">{method.title}</CardTitle>
                          <Badge variant="outline" className={`text-${method.color} border-${method.color}`}>
                            {method.impact}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{method.description}</p>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-dna-forest">Examples:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {method.examples.map((example, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 text-dna-emerald" />
                              <span>{example}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button className={`w-full mt-6 bg-${method.color} hover:bg-${method.color}/90 text-white`}>
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Impact Dashboard */}
        <div className="py-16 bg-gradient-to-r from-dna-mint/10 to-dna-emerald/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-dna-forest mb-4">
                Community Impact by Sector
              </h2>
              <p className="text-xl text-gray-600">
                See how contributions are making a difference across key areas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {impactAreas.map((area, index) => (
                <Card key={index} className="border-dna-emerald/20 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-dna-forest text-lg">{area.area}</h3>
                      <TrendingUp className="w-5 h-5 text-dna-emerald" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Projects</span>
                        <span className="font-semibold text-dna-forest">{area.projects}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Funding</span>
                        <span className="font-semibold text-dna-emerald">{area.funding}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-dna-emerald h-2 rounded-full" 
                          style={{ width: `${Math.min((parseInt(area.funding.replace('$', '').replace('K', '')) / 650) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Card className="border-2 border-dna-gold/20 bg-gradient-to-r from-dna-gold/5 to-dna-copper/5">
              <CardContent className="p-12">
                <Handshake className="w-16 h-16 text-dna-gold mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-dna-forest mb-4">
                  Ready to Make Your Mark?
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Join thousands of diaspora members who are actively contributing to community development 
                  and creating lasting change across Africa and beyond.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-dna-copper hover:bg-dna-gold text-white">
                    Start Contributing
                  </Button>
                  <Button size="lg" variant="outline" className="border-dna-forest text-dna-forest hover:bg-dna-forest hover:text-white">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contribute;
