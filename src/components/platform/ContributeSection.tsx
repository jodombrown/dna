import React from 'react';
import { Heart, DollarSign, Clock, Users, Lightbulb, ArrowRight, Award, TrendingUp, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SwipeableCardStack from './SwipeableCardStack';

const ContributeSection = () => {
  const navigate = useNavigate();

  const contributions = [
    {
      type: 'Capital',
      title: 'Seed Investment Opportunity',
      amount: '$5,000 - $50,000',
      project: 'Solar Education Initiative',
      impact: '10 schools powered',
      icon: DollarSign,
      gradient: 'from-dna-gold to-dna-ochre',
      badge: 'Investment',
      recognition: '+500 Impact Points',
    },
    {
      type: 'Skills',
      title: 'Marketing Expertise Needed',
      commitment: '4 hours/week for 3 months',
      project: 'HealthTech Platform Launch',
      impact: 'Reach 100K users',
      icon: Lightbulb,
      gradient: 'from-dna-copper to-dna-gold',
      badge: 'Expertise',
      recognition: 'Featured Contributor Badge',
    },
    {
      type: 'Time',
      title: 'Volunteer as Mentor',
      commitment: '2 sessions/month',
      project: 'Youth Tech Academy',
      impact: 'Guide 20 students',
      icon: Clock,
      gradient: 'from-dna-emerald to-dna-forest',
      badge: 'Mentorship',
      recognition: 'Community Leader Status',
    },
  ];

  const handleCardClick = (index: number) => {
    navigate('/contribute');
  };

  const renderCard = (contribution: typeof contributions[0]) => {
    const Icon = contribution.icon;
    return (
      <div className={`bg-gradient-to-br ${contribution.gradient} rounded-3xl p-1.5 shadow-2xl h-full w-full`}>
        <div className="bg-white rounded-[22px] overflow-hidden h-full flex flex-col">
          <div className={`bg-gradient-to-r ${contribution.gradient} text-white p-6`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">Your Impact Dashboard</h3>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-sm text-white/80">Make your impact</p>
          </div>
          
          <div className="p-6 space-y-6 flex-1">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-dna-gold text-white text-xs">{contribution.badge}</Badge>
                <Badge variant="outline" className="text-xs">{contribution.type}</Badge>
              </div>
              <h4 className="font-bold text-xl text-gray-900 mb-1">{contribution.title}</h4>
            </div>

            <div className="bg-dna-gold/5 rounded-xl p-4 border-2 border-dna-gold/30">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {contribution.type === 'Capital' ? 'Investment Range' : 'Time Commitment'}
              </p>
              <p className="text-lg font-bold text-gray-900">
                {contribution.amount || contribution.commitment}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Contributing To</p>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-dna-emerald to-dna-forest rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{contribution.project}</p>
                </div>
              </div>
            </div>

            <div className="bg-dna-emerald/5 rounded-xl p-4 border-2 border-dna-emerald/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-dna-emerald" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Expected Impact</p>
              </div>
              <p className="text-sm font-bold text-gray-900">{contribution.impact}</p>
            </div>

            <div className="bg-gradient-to-r from-dna-copper/10 to-dna-gold/10 rounded-xl p-4 border-2 border-dna-copper/30">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-dna-copper" />
                <div>
                  <p className="text-xs font-semibold text-gray-500">You'll Earn</p>
                  <p className="text-sm font-bold text-gray-900">{contribution.recognition}</p>
                </div>
              </div>
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-dna-gold to-dna-ochre hover:from-dna-ochre hover:to-dna-gold text-white font-semibold"
            >
              Contribute Now
            </Button>

            <p className="text-xs text-center text-gray-500">
              Track your impact and earn recognition →
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="contribute-section" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12 items-center">
          {/* Left: Card Preview (Desktop) / Swipeable Cards (Mobile) */}
          <div className="order-2 lg:order-1">
            <SwipeableCardStack
              cards={contributions.map((contribution) => renderCard(contribution))}
              onCardClick={handleCardClick}
            />
          </div>

          {/* Right: Text Content */}
          <div className="order-1 lg:order-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-dna-gold to-dna-ochre rounded-xl flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Contribute</h2>
            </div>
            <p className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
              Deploy Your Assets Where They Matter Most
            </p>
            <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
              Mobilize your unique assets—time, attention, networks, skills, expertise, research, capital, and more—toward initiatives you believe in. Track your real-time impact and earn recognition.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-dna-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Target className="w-4 h-4 text-dna-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Seven Pathways to Impact</h3>
                  <p className="text-sm text-gray-600">Find the right way to contribute</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-dna-copper/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Lightbulb className="w-4 h-4 text-dna-copper" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Skills-Based Contributions</h3>
                  <p className="text-sm text-gray-600">Share your expertise where it matters</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-dna-emerald/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Award className="w-4 h-4 text-dna-emerald" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Real-Time Impact Tracking</h3>
                  <p className="text-sm text-gray-600">See your contribution's effect</p>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => navigate('/contribute')}
              className="bg-dna-gold hover:bg-dna-ochre text-white inline-flex items-center gap-2"
            >
              Explore Pathways to Impact
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContributeSection;
