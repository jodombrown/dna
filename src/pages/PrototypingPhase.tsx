
import React, { useState } from 'react';
import PhaseObjectives from '@/components/phases/PhaseObjectives';
import PhaseTimeline from '@/components/phases/PhaseTimeline';
import PhaseMetrics from '@/components/phases/PhaseMetrics';
import { Palette, Users, TestTube, Target, TrendingUp, CheckCircle, Lightbulb, Zap, ArrowRight } from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BetaSignupDialog from '@/components/auth/BetaSignupDialog';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { useNavigate } from 'react-router-dom';
import PhaseHero from '@/components/phases/PhaseHero';

const objectives = [
  {
    icon: <Palette className="w-5 h-5" />,
    title: "User Experience Design & Wireframing",
    description: "Create intuitive interfaces and interactive wireframes based on diaspora research insights. We're crafting user flows that feel natural to African professionals worldwide, ensuring every interaction reflects our community's unique networking patterns and professional aspirations.",
    status: "Planned",
    completion: 0
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Community-Driven Usability Testing",
    description: "Engage diaspora community members in comprehensive testing sessions to validate our design assumptions. Through remote and in-person testing across different time zones and cultural contexts, we'll ensure the platform resonates authentically with our global community.",
    status: "Planned", 
    completion: 0
  },
  {
    icon: <TestTube className="w-5 h-5" />,
    title: "Technical Architecture Validation",
    description: "Verify the feasibility of our proposed features through rapid prototyping and systematic experimentation. We'll validate technology choices, identify scalability challenges, and refine our technical approach to ensure reliable performance across diverse global markets.",
    status: "Planned",
    completion: 0
  },
];

const timeline = [
  {
    quarter: "Oct 2025",
    title: "Design Foundation & Interactive Wireframes",
    items: [
      "Develop culturally-informed interface designs reflecting diaspora preferences",
      "Create clickable prototypes using advanced design tools for real user testing",
      "Conduct stakeholder reviews with diaspora leaders and potential early adopters",
      "Refine visual language and interaction patterns based on community feedback"
    ],
    status: "upcoming" as const,
  },
  {
    quarter: "Nov-Dec 2025", 
    title: "Global Usability Testing & Design Iteration",
    items: [
      "Recruit diverse diaspora participants across continents for comprehensive testing",
      "Execute remote usability sessions accommodating global time zones and languages",
      "Analyze behavioral patterns and cultural preferences in professional networking",
      "Implement design improvements based on real user insights and cultural nuances"
    ],
    status: "upcoming" as const,
  }
];

const fallbackMetrics = [
  {
    id: "1",
    label: "Design Iterations",
    value: "0",
    target: "20",
    icon: "palette",
    color: "bg-dna-emerald"
  },
  {
    id: "2", 
    label: "User Interviews",
    value: "0",
    target: "50",
    icon: "users",
    color: "bg-dna-forest"
  },
  {
    id: "3",
    label: "Usability Score",
    value: "0",
    target: "80",
    icon: "trending-up",
    color: "bg-dna-copper"
  },
  {
    id: "4",
    label: "Prototype Tests",
    value: "0",
    target: "100",
    icon: "zap",
    color: "bg-dna-gold"
  }
];

const PrototypingPhase = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const [isBetaSignupOpen, setIsBetaSignupOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10 flex flex-col">
      <Header />
      
      <PhaseHero
        badge="Phase 2 • Prototyping"
        title="Prototyping"
        description="Transforming research insights into tangible user experiences through culturally-informed design and community-driven testing across the African diaspora."
        prevPhase={{ label: "Previous Phase", url: "/phase/market-research" }}
        nextPhase={{ label: "Next Phase", url: "/phase/customer-discovery" }}
        gradient="relative bg-gradient-to-r from-dna-emerald/90 via-dna-forest/90 to-dna-copper/90 bg-[url('https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center before:absolute before:inset-0 before:bg-gradient-to-r before:from-dna-emerald/80 before:via-dna-forest/80 before:to-dna-copper/80 before:z-0"
      />

      {/* Phase Overview */}
      <section className="py-12 md:py-16 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">From Research to Reality</h2>
            <p className="text-base md:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed px-4">
              This phase bridges the gap between understanding our community's needs and creating solutions they'll love. 
              We're translating cultural insights and professional aspirations into intuitive designs that feel authentically African 
              while meeting global standards. Every wireframe, every interaction, every visual choice reflects our community's 
              unique approach to professional networking and collaboration.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 px-4 lg:px-16 max-w-6xl mx-auto">
            <div className="text-center p-6 md:p-8 bg-gradient-to-br from-dna-mint/20 to-dna-emerald/20 rounded-2xl border border-dna-emerald/30">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-dna-emerald to-dna-forest rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                <Palette className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">Culturally-Informed Design</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">Crafting interfaces that honor African professional culture while embracing global connectivity standards.</p>
            </div>
            
            <div className="text-center p-6 md:p-8 bg-gradient-to-br from-dna-emerald/20 to-dna-copper/20 rounded-2xl border border-dna-forest/30">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-dna-forest to-dna-copper rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">Global Community Testing</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">Gathering feedback from diaspora professionals across continents to ensure universal accessibility and cultural relevance.</p>
            </div>
            
            <div className="text-center p-6 md:p-8 bg-gradient-to-br from-dna-copper/20 to-dna-gold/20 rounded-2xl border border-dna-copper/30">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-dna-copper to-dna-gold rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                <TestTube className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">Technical Validation</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">Ensuring our designs can be built reliably and scale efficiently to serve our growing global community.</p>
            </div>
          </div>
        </div>
      </section>

      <PhaseObjectives objectives={objectives} color="dna-emerald" />
      <PhaseTimeline milestones={timeline} color="dna-forest" />
      <PhaseMetrics phaseSlug="prototyping" fallbackMetrics={fallbackMetrics} />
      
      {/* Design Testing CTA */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-dna-mint/20 via-dna-emerald/10 to-dna-copper/20">
        <div className="w-full text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-12 border border-dna-emerald/30 max-w-4xl mx-auto">
            <Lightbulb className="w-12 h-12 md:w-16 md:h-16 text-dna-emerald mx-auto mb-4 md:mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
              Shape DNA's User Experience
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 leading-relaxed px-4">
              Join our design testing community and influence how the DNA platform feels to use. Your cultural insights 
              and professional perspective will directly shape an interface that truly serves our global African diaspora community.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-md mx-auto">
              <button 
                onClick={() => setIsBetaSignupOpen(true)}
                className="bg-dna-emerald text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full font-semibold hover:bg-dna-forest transition-colors text-sm md:text-base"
              >
                Join Design Testing
              </button>
              <button className="border-2 border-dna-emerald text-dna-emerald px-6 md:px-8 py-2.5 md:py-3 rounded-full font-semibold hover:bg-dna-mint hover:text-dna-forest hover:border-dna-forest transition-colors text-sm md:text-base">
                View Prototype Designs
              </button>
            </div>
          </div>
        </div>
      </section>

      <BetaSignupDialog 
        isOpen={isBetaSignupOpen} 
        onClose={() => setIsBetaSignupOpen(false)} 
      />
      
      <Footer />
    </div>
  );
};

export default PrototypingPhase;
