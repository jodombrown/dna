
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Palette, Users, Code, TestTube, Rocket } from 'lucide-react';

const phases = [
  {
    phase: 1,
    title: "Market Research",
    description: "Understanding diaspora needs and validating our concept",
    status: "Active",
    timeline: "Jun - Sep 2025",
    path: "/phase/market-research",
    icon: <Search className="w-5 h-5 md:w-6 md:h-6" />,
    color: "bg-dna-emerald"
  },
  {
    phase: 2,
    title: "Prototyping",
    description: "Designing user experiences and testing prototypes",
    status: "Planned",
    timeline: "Oct - Dec 2025",
    path: "/phase/prototyping",
    icon: <Palette className="w-5 h-5 md:w-6 md:h-6" />,
    color: "bg-dna-forest"
  },
  {
    phase: 3,
    title: "Customer Discovery",
    description: "Measuring early adopter interest and validation",
    status: "Planned",
    timeline: "Jan - Feb 2026",
    path: "/phase/customer-discovery",
    icon: <Users className="w-5 h-5 md:w-6 md:h-6" />,
    color: "bg-dna-copper"
  },
  {
    phase: 4,
    title: "MVP Build",
    description: "Building the minimum viable product",
    status: "Planned",
    timeline: "Mar - Jul 2026",
    path: "/phase/mvp",
    icon: <Code className="w-5 h-5 md:w-6 md:h-6" />,
    color: "bg-dna-gold"
  },
  {
    phase: 5,
    title: "Beta Validation",
    description: "Testing with real users and validating product-market fit",
    status: "Planned",
    timeline: "Aug 2026",
    path: "/phase/beta-validation",
    icon: <TestTube className="w-5 h-5 md:w-6 md:h-6" />,
    color: "bg-dna-mint"
  },
  {
    phase: 6,
    title: "Go-to-Market",
    description: "Global launch and sustainable growth",
    status: "Planned",
    timeline: "Sep 2026+",
    path: "/phase/go-to-market",
    icon: <Rocket className="w-5 h-5 md:w-6 md:h-6" />,
    color: "bg-dna-emerald"
  }
];

const PhaseNavigation = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Our Development Journey</h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto px-4">
            Follow our transparent, phase-by-phase approach to building DNA. Each phase has clear objectives, 
            timelines, and measurable outcomes to ensure we're building something that truly serves the African diaspora.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {phases.map((phase) => (
            <Card 
              key={phase.phase} 
              className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-l-4 border-l-dna-emerald relative z-10"
              onClick={() => navigate(phase.path)}
            >
              <CardHeader className="pb-3 md:pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 md:w-12 md:h-12 ${phase.color} rounded-xl flex items-center justify-center text-white`}>
                    {phase.icon}
                  </div>
                  <Badge variant={phase.status === "Active" ? "default" : "secondary"} className="text-xs">
                    {phase.status}
                  </Badge>
                </div>
                <CardTitle className="text-base md:text-lg text-gray-900">
                  Phase {phase.phase}: {phase.title}
                </CardTitle>
                <p className="text-xs md:text-sm text-gray-500">{phase.timeline}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 mb-3 md:mb-4 text-sm md:text-base leading-relaxed">{phase.description}</p>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(phase.path);
                  }}
                  className="w-full bg-dna-emerald hover:bg-dna-forest text-white text-sm md:text-base"
                >
                  Learn More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PhaseNavigation;
