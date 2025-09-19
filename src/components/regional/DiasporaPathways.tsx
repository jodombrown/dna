import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Users, Building2, BookOpen, Briefcase, Gavel } from 'lucide-react';

interface DiasporaPathwaysProps {
  onPathwaySelect: (pathway: string) => void;
}

const DiasporaPathways: React.FC<DiasporaPathwaysProps> = ({ onPathwaySelect }) => {
  const pathways = [
    {
      id: 'investor',
      title: 'Diaspora Investors',
      description: 'Investment opportunities, market analysis, and ROI insights for building economic bridges',
      icon: TrendingUp,
      color: 'dna-emerald',
      features: ['Market Analysis', 'Investment Opportunities', 'Risk Assessment', 'Success Stories'],
      cta: 'Explore Investment Data'
    },
    {
      id: 'entrepreneur',
      title: 'Entrepreneurs & Founders',
      description: 'Business ecosystem insights, startup support, and partnership opportunities across the region',
      icon: Building2,
      color: 'dna-copper',
      features: ['Startup Ecosystem', 'Business Environment', 'Funding Landscape', 'Mentorship Networks'],
      cta: 'Discover Opportunities'
    },
    {
      id: 'policy',
      title: 'Policy Makers & Advocates',
      description: 'Governance insights, policy impact analysis, and diaspora engagement frameworks',
      icon: Gavel,
      color: 'north-africa-terracotta',
      features: ['Policy Landscape', 'Governance Metrics', 'Impact Assessment', 'Advocacy Tools'],
      cta: 'View Policy Insights'
    },
    {
      id: 'researcher',
      title: 'Researchers & Students',
      description: 'Comprehensive data sets, academic insights, and research collaboration opportunities',
      icon: BookOpen,
      color: 'north-africa-oasis',
      features: ['Research Data', 'Academic Papers', 'Collaboration Networks', 'Grant Opportunities'],
      cta: 'Access Research Hub'
    },
    {
      id: 'professional',
      title: 'Professionals & Consultants',
      description: 'Industry insights, professional networks, and expertise exchange platforms',
      icon: Briefcase,
      color: 'dna-forest',
      features: ['Industry Analysis', 'Professional Networks', 'Skill Matching', 'Project Opportunities'],
      cta: 'Connect with Network'
    },
    {
      id: 'community',
      title: 'Community Leaders',
      description: 'Cultural preservation, community impact projects, and diaspora connectivity initiatives',
      icon: Users,
      color: 'north-africa-desert',
      features: ['Community Projects', 'Cultural Initiatives', 'Diaspora Mapping', 'Impact Metrics'],
      cta: 'Join Community Hub'
    }
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-dna-mint/10 via-background to-north-africa-sand/10">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-2 w-8 bg-dna-emerald rounded-full" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-dna-forest to-dna-emerald bg-clip-text text-transparent">
              Your Diaspora Journey Starts Here
            </h2>
            <div className="h-2 w-8 bg-dna-copper rounded-full" />
          </div>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
            Discover insights, opportunities, and connections tailored to your role in strengthening 
            Africa-diaspora economic partnerships. Choose your pathway to explore what matters most to you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pathways.map((pathway) => (
            <Card 
              key={pathway.id} 
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 hover:scale-105"
              style={{ borderLeftColor: `hsl(var(--${pathway.color}))` }}
              onClick={() => onPathwaySelect(pathway.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="p-3 rounded-lg group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `hsl(var(--${pathway.color}) / 0.1)` }}
                  >
                    <pathway.icon 
                      className="h-6 w-6" 
                      style={{ color: `hsl(var(--${pathway.color}))` }}
                    />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1" />
                </div>
                <CardTitle className="text-lg mb-2">{pathway.title}</CardTitle>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pathway.description}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {pathway.features.map((feature, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline" 
                        className="text-xs"
                        style={{ borderColor: `hsl(var(--${pathway.color}) / 0.3)` }}
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    className="w-full group-hover:shadow-md transition-all"
                    style={{ 
                      backgroundColor: `hsl(var(--${pathway.color}))`,
                      color: 'white'
                    }}
                  >
                    {pathway.cta}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-dna-emerald/10 to-dna-copper/10 rounded-xl p-8 border border-dna-emerald/20">
            <h3 className="text-xl font-semibold mb-4 text-dna-forest">
              Multiple Interests? No Problem.
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Many diaspora members wear multiple hats. Explore different pathways to get a comprehensive 
              view of opportunities that align with your diverse interests and goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" className="border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white">
                Compare All Pathways
              </Button>
              <Button className="bg-dna-forest hover:bg-dna-forest/90">
                Create My Custom Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiasporaPathways;