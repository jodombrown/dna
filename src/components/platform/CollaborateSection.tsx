import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Handshake, ArrowRight, Users, DollarSign, Target, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import SwipeableCardStack from './SwipeableCardStack';

const CollaborateSection = () => {
  const navigate = useNavigate();

  const projects = [
    {
      title: 'Solar Education Initiative',
      description: 'Bringing sustainable energy to rural schools',
      status: 'Active',
      progress: 68,
      team: 12,
      countries: 6,
      pooled: '$2.3M',
      gradient: 'from-dna-copper to-dna-gold',
    },
    {
      title: 'HealthTech Platform',
      description: 'Digital health solutions for African communities',
      status: 'Planning',
      progress: 35,
      team: 8,
      countries: 4,
      pooled: '$1.8M',
      gradient: 'from-dna-gold to-dna-ochre',
    },
    {
      title: 'AgriTech Supply Chain',
      description: 'Connecting farmers to markets efficiently',
      status: 'Seeking Team',
      progress: 15,
      team: 5,
      countries: 3,
      pooled: '$850K',
      gradient: 'from-dna-emerald to-dna-forest',
    },
  ];

  const handleCardClick = (index: number) => {
    navigate('/collaborate');
  };

  const renderCard = (project: typeof projects[0]) => (
    <div className={`bg-gradient-to-br ${project.gradient} rounded-3xl p-1.5 shadow-2xl h-full w-full`}>
      <div className="bg-white rounded-[22px] overflow-hidden h-full flex flex-col">
        <div className={`bg-gradient-to-r ${project.gradient} text-white p-6`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">Active Collaborations</h3>
            <Handshake className="w-5 h-5" />
          </div>
          <p className="text-sm text-white/80">Live collaborations</p>
        </div>
        
        <div className="p-6 space-y-6 flex-1">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h4 className="font-bold text-xl text-gray-900">{project.title}</h4>
              <Badge className="bg-dna-emerald text-white text-xs">{project.status}</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">{project.description}</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold text-dna-copper">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-dna-copper/10 rounded-lg">
              <Users className="w-4 h-4 mx-auto mb-1 text-dna-copper" />
              <p className="text-sm font-bold text-gray-900">{project.team}</p>
              <p className="text-xs text-gray-500">Team</p>
            </div>
            <div className="text-center p-3 bg-dna-gold/10 rounded-lg">
              <Target className="w-4 h-4 mx-auto mb-1 text-dna-ochre" />
              <p className="text-sm font-bold text-gray-900">{project.countries}</p>
              <p className="text-xs text-gray-500">Countries</p>
            </div>
            <div className="text-center p-3 bg-dna-emerald/10 rounded-lg">
              <DollarSign className="w-4 h-4 mx-auto mb-1 text-dna-emerald" />
              <p className="text-sm font-bold text-gray-900">{project.pooled}</p>
              <p className="text-xs text-gray-500">Pooled</p>
            </div>
          </div>

          <Button 
            className="w-full bg-gradient-to-r from-dna-copper to-dna-gold hover:from-dna-gold hover:to-dna-copper text-white font-semibold"
          >
            Explore Collaboration
          </Button>

          <p className="text-xs text-center text-gray-500">
            Join the team and pool resources →
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <section id="collaborate-section" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 items-center">
          {/* Left: Text Content */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-dna-copper to-dna-gold rounded-xl flex items-center justify-center flex-shrink-0">
                <Handshake className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Collaborate</h2>
            </div>
            <p className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
              Join Forces on Cross-Border Projects
            </p>
            <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
              Work together on meaningful projects that drive African development. Pool resources, share specialized knowledge, and amplify your collective impact across borders.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-dna-copper/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users className="w-4 h-4 text-dna-copper" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Cross-Border Project Teams</h3>
                  <p className="text-sm text-gray-600">Join forces across continents</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-dna-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TrendingUp className="w-4 h-4 text-dna-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Knowledge Sharing Platforms</h3>
                  <p className="text-sm text-gray-600">Learn and share expertise</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-dna-emerald/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <DollarSign className="w-4 h-4 text-dna-emerald" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Resource Pooling Tools</h3>
                  <p className="text-sm text-gray-600">Combine capital and skills</p>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => navigate('/collaborate')}
              className="bg-dna-copper hover:bg-dna-gold text-white inline-flex items-center gap-2"
            >
              Explore Active Collaborations
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Right: Card Preview (Desktop) / Swipeable Cards (Mobile) */}
          <div>
            <SwipeableCardStack
              cards={projects.map((project) => renderCard(project))}
              onCardClick={handleCardClick}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CollaborateSection;
