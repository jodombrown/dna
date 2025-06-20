
import React, { useState } from 'react';
import PhaseObjectives from '@/components/phases/PhaseObjectives';
import PhaseTimeline from '@/components/phases/PhaseTimeline';
import PhaseMetrics from '@/components/phases/PhaseMetrics';
import { Megaphone, Globe, TrendingUp, BarChart3, CheckCircle, Lightbulb, Rocket, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BetaSignupDialog from '@/components/auth/BetaSignupDialog';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const objectives = [
  {
    icon: <Megaphone className="w-5 h-5" />,
    title: "Global Platform Launch & Market Penetration",
    description: "Execute a comprehensive global launch strategy to bring the DNA platform to target diaspora communities across major regions including North America, Europe, and key African markets. Implement multi-channel marketing campaigns, strategic partnerships, and community-driven growth initiatives to achieve sustainable user acquisition and engagement.",
    status: "Planned",
    completion: 0
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "International Expansion & Regional Adaptation",
    description: "Establish localized DNA presence in key diaspora regions through strategic partnerships, local community leaders, and region-specific features. Adapt platform functionality to serve diverse cultural contexts while maintaining our core mission of connecting, collaborating, and contributing across the African diaspora ecosystem.",
    status: "Planned",
    completion: 0
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Growth Optimization & Sustainable Scaling",
    description: "Implement data-driven growth optimization strategies including user acquisition funnels, retention programs, and viral growth mechanisms. Establish sustainable revenue streams, strategic partnerships, and community-driven expansion to ensure long-term platform viability and impact across the diaspora community.",
    status: "Planned",
    completion: 0
  },
];

const timeline = [
  {
    quarter: "Sep 2026",
    title: "Launch Preparation & Market Entry",
    items: [
      "Finalize global launch strategy with region-specific go-to-market approaches",
      "Complete platform internationalization with multi-language and cultural adaptations",
      "Establish strategic partnerships with diaspora organizations and community leaders",
      "Launch comprehensive marketing campaigns across digital and traditional channels"
    ],
    status: "upcoming" as const,
  },
  {
    quarter: "Oct 2026",
    title: "Global Rollout & Community Expansion",
    items: [
      "Execute phased global rollout starting with key diaspora hubs and markets",
      "Implement user acquisition campaigns with performance tracking and optimization",
      "Launch ambassador programs with community leaders and influential diaspora figures",
      "Establish local community chapters and region-specific engagement initiatives"
    ],
    status: "upcoming" as const,
  },
  {
    quarter: "Nov 2026+",
    title: "Scale Optimization & Sustainable Growth",
    items: [
      "Optimize platform performance and user experience based on global usage patterns",
      "Implement advanced analytics and AI-driven personalization for enhanced user engagement",
      "Expand revenue streams through premium features, partnerships, and enterprise solutions",
      "Establish long-term sustainability through community governance and strategic partnerships"
    ],
    status: "upcoming" as const,
  }
];

const fallbackMetrics = [
  {
    id: "1",
    label: "Global Users",
    value: "0",
    target: "50,000",
    icon: "globe",
    color: "bg-green-500"
  },
  {
    id: "2",
    label: "Monthly Revenue",
    value: "$0",
    target: "$150K",
    icon: "trending-up",
    color: "bg-emerald-500"
  },
  {
    id: "3",
    label: "Active Countries",
    value: "0",
    target: "25",
    icon: "flag",
    color: "bg-teal-500"
  },
  {
    id: "4",
    label: "Corporate Partners",
    value: "0",
    target: "200",
    icon: "briefcase",
    color: "bg-green-600"
  }
];

const GoToMarketPhase = () => {
  useScrollToTop();
  const [isBetaSignupOpen, setIsBetaSignupOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex flex-col">
      <Header />
      
      {/* Hero Section with Global Launch Image */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/85 via-emerald-900/85 to-teal-900/85" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
            <Rocket className="w-5 h-5 mr-2" />
            <span className="font-semibold">Phase 6 • Global Launch</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Go-to-Market
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-white/90 mb-8 leading-relaxed">
            Launching DNA globally to connect the African diaspora worldwide, creating sustainable growth through strategic partnerships and community-driven expansion.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button 
              onClick={() => setIsBetaSignupOpen(true)}
              className="bg-white text-green-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Join Launch Community
            </button>
            <button 
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors opacity-50 cursor-not-allowed"
              disabled
            >
              Final Phase
            </button>
          </div>
        </div>
      </section>

      {/* Launch Strategy Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Global DNA Movement</h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              This is where DNA becomes a global movement for the African diaspora. Our go-to-market strategy focuses on 
              authentic community building, strategic partnerships, and sustainable growth that honors our mission. We're not 
              just launching a platform - we're catalyzing a movement that strengthens diaspora connections and accelerates Africa's development through collective action.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Megaphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Strategic Launch</h3>
              <p className="text-gray-600 leading-relaxed">Coordinated global launch across key diaspora markets with culturally-relevant messaging and community-driven growth strategies.</p>
            </div>
            
            <div className="text-center p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Global Expansion</h3>
              <p className="text-gray-600 leading-relaxed">International expansion through local partnerships, regional adaptation, and community leadership across diaspora hubs worldwide.</p>
            </div>
            
            <div className="text-center p-8 bg-gradient-to-br from-teal-50 to-green-50 rounded-2xl border border-teal-200">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Sustainable Growth</h3>
              <p className="text-gray-600 leading-relaxed">Building sustainable revenue streams and growth mechanisms that support long-term platform viability and community impact.</p>
            </div>
          </div>
        </div>
      </section>

      <PhaseObjectives objectives={objectives} color="green-600" />
      <PhaseTimeline milestones={timeline} color="emerald-600" />
      <PhaseMetrics phaseSlug="go-to-market" fallbackMetrics={fallbackMetrics} />
      
      {/* Launch Community CTA */}
      <section className="py-16 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-green-200">
            <Lightbulb className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Be Part of the DNA Movement
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Join our launch community to be among the first to experience DNA when we go live globally. Help us spread 
              the word, invite your networks, and become a catalyst for strengthening diaspora connections worldwide. 
              Together, we can create a movement that transforms how the African diaspora connects, collaborates, and contributes to Africa's development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setIsBetaSignupOpen(true)}
                className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors"
              >
                Join Launch Community
              </button>
              <button className="border-2 border-green-600 text-green-600 px-8 py-3 rounded-full font-semibold hover:bg-green-50 transition-colors">
                Become an Ambassador
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
