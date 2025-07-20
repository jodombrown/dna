import React from 'react';
import Header from '@/components/Header';
import SEOHead from '@/components/SEOHead';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Target } from 'lucide-react';

const phases = [
  {
    name: 'Market Research',
    path: '/phase/market-research',
    phase: 1,
    timeline: 'Jun - Sep 2025',
    description: 'Understanding the diaspora landscape and community needs through comprehensive research.',
    status: 'current'
  },
  {
    name: 'Prototyping',
    path: '/phase/prototyping',
    phase: 2,
    timeline: 'Oct - Dec 2025',
    description: 'Building interactive prototypes and testing core platform concepts.',
    status: 'upcoming'
  },
  {
    name: 'Customer Discovery',
    path: '/phase/customer-discovery',
    phase: 3,
    timeline: 'Jan - Feb 2026',
    description: 'Engaging with early adopters to validate assumptions and gather feedback.',
    status: 'upcoming'
  },
  {
    name: 'MVP Build',
    path: '/phase/mvp',
    phase: 4,
    timeline: 'Mar - Jul 2026',
    description: 'Developing the minimum viable product with core features.',
    status: 'upcoming'
  },
  {
    name: 'Beta Validation',
    path: '/phase/beta-validation',
    phase: 5,
    timeline: 'Aug 2026',
    description: 'Testing the platform with a limited group of beta users.',
    status: 'upcoming'
  },
  {
    name: 'Go-to-Market',
    path: '/phase/go-to-market',
    phase: 6,
    timeline: 'Sep 2026+',
    description: 'Launching the platform publicly and scaling the community.',
    status: 'upcoming'
  }
];

const Phases = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Development Phases - DNA Network"
        description="Follow our journey building the Diaspora Network of Africa. Track our progress through each development phase from research to launch."
        keywords="DNA development, African diaspora platform development, startup phases, MVP timeline"
        url="https://diasporanetwork.africa/phases"
      />
      
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-dna-emerald via-dna-forest to-dna-copper py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Our Development Journey
          </h1>
          <p className="text-xl md:text-2xl text-dna-mint mb-8">
            Building the future of the African diaspora network, one phase at a time
          </p>
        </div>
      </section>

      {/* Phases Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dna-forest mb-4">
              Development Roadmap
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We're building DNA in phases, with each milestone bringing us closer to connecting 
              the global African diaspora. Track our progress and get involved.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {phases.map((phase) => (
              <Card 
                key={phase.phase} 
                className={`group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${
                  phase.status === 'current' 
                    ? 'border-dna-emerald bg-dna-mint/10' 
                    : 'border-gray-200 hover:border-dna-emerald/50'
                }`}
                onClick={() => navigate(phase.path)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      phase.status === 'current'
                        ? 'bg-dna-emerald text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      Phase {phase.phase}
                    </span>
                    {phase.status === 'current' && (
                      <span className="bg-dna-gold text-white px-2 py-1 rounded-full text-xs font-medium">
                        Current
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-xl text-dna-forest group-hover:text-dna-emerald transition-colors">
                    {phase.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 text-dna-copper">
                    <Calendar className="w-4 h-4" />
                    {phase.timeline}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    {phase.description}
                  </p>
                  <Button 
                    variant="ghost" 
                    className="w-full group-hover:bg-dna-emerald group-hover:text-white transition-colors"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-dna-emerald to-dna-forest rounded-2xl p-8 text-white">
              <Target className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">
                Join Our Journey
              </h3>
              <p className="text-dna-mint mb-6 max-w-2xl mx-auto">
                Be part of building the premier platform for the African diaspora. 
                Your input and participation help shape our development.
              </p>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-white text-dna-forest hover:bg-dna-mint hover:text-dna-forest"
              >
                Get Involved
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Phases;