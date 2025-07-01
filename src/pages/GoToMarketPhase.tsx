
import React, { useState } from 'react';
import PhaseObjectives from '@/components/phases/PhaseObjectives';
import PhaseTimeline from '@/components/phases/PhaseTimeline';
import PhaseMetrics from '@/components/phases/PhaseMetrics';
import { Rocket, TrendingUp, Globe, Target, Users, CheckCircle, Lightbulb, BarChart3, ArrowRight } from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BetaSignupDialog from '@/components/auth/BetaSignupDialog';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { useNavigate } from 'react-router-dom';
import PhaseHero from '@/components/phases/PhaseHero';

const objectives = [
  {
    icon: <Rocket className="w-5 h-5" />,
    title: "Global Launch Strategy & Execution",
    description: "Execute a coordinated global launch that introduces DNA to diaspora communities across six continents. We're orchestrating regional launch events, strategic partnerships with African professional organizations, and targeted outreach campaigns that respect cultural nuances while building unified momentum.",
    status: "Planned",
    completion: 0
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Community Activation & Growth",
    description: "Activate early adopters into passionate community advocates who champion DNA within their professional networks. Through ambassador programs, regional community leaders, and viral referral incentives, we're building organic growth that spreads authentically through trusted diaspora relationships.",
    status: "Planned",
    completion: 0
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Sustainable Growth & Revenue Operations",
    description: "Establish revenue streams that align with our mission while ensuring long-term sustainability. From premium professional features to corporate partnership programs, we're creating value that companies and individuals willingly pay for because it drives real professional and social impact.",
    status: "Planned",
    completion: 0
  },
];

const timeline = [
  {
    quarter: "Sep 2026",
    title: "Strategic Pre-Launch & Partnership Development",
    items: [
      "Secure strategic partnerships with major African diaspora organizations and universities",
      "Launch invitation-only preview program for diaspora leaders and influencers",
      "Execute comprehensive marketing campaigns across key diaspora markets",
      "Establish regional community managers in North America, Europe, Asia, and Australia"
    ],
    status: "upcoming" as const,
  },
  {
    quarter: "Oct-Nov 2026",
    title: "Global Platform Launch & Community Activation",
    items: [
      "Coordinate synchronized launch events across major diaspora cities worldwide",
      "Activate community ambassador programs with regional diaspora leaders",
      "Launch viral referral campaigns incentivizing organic community growth",
      "Implement comprehensive user onboarding and community integration programs"
    ],
    status: "upcoming" as const,
  },
  {
    quarter: "Dec 2026+",
    title: "Growth Optimization & Expansion",
    items: [
      "Deploy advanced analytics and growth optimization based on user behavior patterns",
      "Launch premium features and corporate partnership programs for revenue generation",
      "Expand platform capabilities based on community feedback and market opportunities",
      "Scale operations and support infrastructure to accommodate rapid global growth"
    ],
    status: "upcoming" as const,
  }
];

const fallbackMetrics = [
  {
    id: "1",
    label: "Active Users",
    value: "0",
    target: "10000",
    icon: "users",
    color: "bg-dna-emerald"
  },
  {
    id: "2", 
    label: "Global Reach",
    value: "0",
    target: "50",
    icon: "globe",
    color: "bg-dna-copper"
  },
  {
    id: "3",
    label: "Partnerships",
    value: "0",
    target: "25",
    icon: "handshake",
    color: "bg-dna-gold"
  },
  {
    id: "4",
    label: "Revenue Growth",
    value: "0",
    target: "100",
    icon: "trending-up",
    color: "bg-dna-forest"
  }
];

const GoToMarketPhase = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const [isBetaSignupOpen, setIsBetaSignupOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10 flex flex-col">
      <Header />
      
      <PhaseHero
        badge="Phase 6 • Go-to-Market"
        title="Go-to-Market"
        description="Launching DNA globally to unite the African diaspora through strategic partnerships, community activation, and sustainable growth that transforms professional networking across continents."
        prevPhase={{ label: "Previous Phase", url: "/phase/beta-validation" }}
        gradient="relative bg-gradient-to-r from-dna-copper/90 via-dna-gold/90 to-dna-emerald/90 bg-[url('https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center before:absolute before:inset-0 before:bg-gradient-to-r before:from-dna-copper/80 before:via-dna-gold/80 before:to-dna-emerald/80 before:z-0"
      />

      {/* Launch Strategy Overview */}
      <section className="py-12 md:py-16 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Uniting Diaspora Professionals Globally</h2>
            <p className="text-base md:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed px-4">
              This phase marks DNA's transition from platform to movement. We're not just launching software—we're activating 
              a global network that transforms how African diaspora professionals connect, collaborate, and contribute to the 
              continent's development. Through strategic partnerships, cultural ambassadors, and authentic community building, 
              we're creating sustainable growth that serves our mission while ensuring long-term impact.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 px-4 lg:px-16 max-w-6xl mx-auto">
            <div className="text-center p-6 md:p-8 bg-gradient-to-br from-dna-copper/20 to-dna-gold/20 rounded-2xl border border-dna-copper/30">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-dna-copper to-dna-gold rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                <Rocket className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">Strategic Launch</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">Coordinating global launch events and partnerships that respect regional cultures while building unified momentum.</p>
            </div>
            
            <div className="text-center p-6 md:p-8 bg-gradient-to-br from-dna-gold/20 to-dna-emerald/20 rounded-2xl border border-dna-gold/30">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-dna-gold to-dna-emerald rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">Community Growth</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">Activating passionate advocates and regional ambassadors who champion DNA within their professional networks.</p>
            </div>
            
            <div className="text-center p-6 md:p-8 bg-gradient-to-br from-dna-emerald/20 to-dna-forest/20 rounded-2xl border border-dna-emerald/30">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-dna-emerald to-dna-forest rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">Sustainable Impact</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">Building revenue models that align with our mission while ensuring long-term platform sustainability and growth.</p>
            </div>
          </div>
        </div>
      </section>

      <PhaseObjectives objectives={objectives} color="dna-copper" />
      <PhaseTimeline milestones={timeline} color="dna-gold" />
      <PhaseMetrics phaseSlug="go-to-market" fallbackMetrics={fallbackMetrics} />
      
      {/* Early Access CTA */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-dna-copper/20 via-dna-gold/10 to-dna-emerald/20">
        <div className="w-full text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-12 border border-dna-copper/30 max-w-4xl mx-auto">
            <Globe className="w-12 h-12 md:w-16 md:h-16 text-dna-copper mx-auto mb-4 md:mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
              Be Part of DNA's Global Launch
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 leading-relaxed px-4">
              Join our exclusive early access program and become one of the first diaspora professionals to experience DNA's full potential. 
              Help us launch a platform that transforms how our global community connects, collaborates, and contributes to Africa's future.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-md mx-auto">
              <button 
                onClick={() => setIsBetaSignupOpen(true)}
                className="bg-dna-copper text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full font-semibold hover:bg-dna-gold transition-colors text-sm md:text-base"
              >
                Get Early Access
              </button>
              <button className="border-2 border-dna-copper text-dna-copper px-6 md:px-8 py-2.5 md:py-3 rounded-full font-semibold hover:bg-dna-copper/10 transition-colors text-sm md:text-base">
                View Launch Timeline
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

export default GoToMarketPhase;
