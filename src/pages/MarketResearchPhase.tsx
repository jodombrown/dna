
import React from 'react';
import PhaseHero from '@/components/phases/PhaseHero';
import PhaseObjectives from '@/components/phases/PhaseObjectives';
import PhaseTimeline from '@/components/phases/PhaseTimeline';
import PhaseMetrics from '@/components/phases/PhaseMetrics';
import { Search, Users, FileText, Target, TrendingUp, MessageSquare, BookOpen, BarChart3 } from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const objectives = [
  {
    icon: <Users className="w-5 h-5" />,
    title: "Deep Diaspora Needs Analysis",
    description: "Conduct comprehensive research into diaspora motivations, behaviors, challenges, and unmet needs across different regions, demographics, and professional backgrounds. This involves both quantitative data analysis and qualitative insights gathering to build a complete picture of our target community's experiences and aspirations.",
    status: "In Progress",
    completion: 85
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "DNA Concept Market Validation",
    description: "Test and validate our core platform concept, value propositions, and potential market fit through structured feedback sessions, surveys, and stakeholder interviews. Ensure our vision aligns with real community needs and has strong potential for adoption and engagement.",
    status: "Active",
    completion: 70
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Market Opportunity Quantification",
    description: "Quantify the total addressable market and specific market segments using public data sources, proprietary research, competitive analysis, and demographic studies. Establish clear metrics for market size, growth potential, and revenue opportunities within the diaspora ecosystem.",
    status: "Active",
    completion: 60
  },
];

const timeline = [
  {
    quarter: "Jun 2025",
    title: "Research Foundation & Methodology",
    items: [
      "AI-powered research synthesis of global diaspora trends and patterns",
      "Comprehensive competitive landscape mapping and analysis",
      "Research methodology framework development and validation",
      "Strategic stakeholder identification and systematic outreach planning"
    ],
    status: "active" as const,
  },
  {
    quarter: "Jul-Aug 2025",
    title: "Data Collection & Stakeholder Engagement",
    items: [
      "50+ in-depth stakeholder interviews (auto-scheduled and transcribed)",
      "Advanced sentiment analysis on community surveys and feedback",
      "Detailed persona development workshops with community leaders",
      "User journey mapping sessions across different diaspora segments"
    ],
    status: "upcoming" as const,
  },
  {
    quarter: "Sep 2025",
    title: "Analysis & Strategic Validation",
    items: [
      "Comprehensive research report compilation and synthesis",
      "Market size validation using multiple data sources and methodologies",
      "Strategic validation memo with actionable insights and recommendations",
      "Phase 2 planning, resource allocation, and team transition preparation"
    ],
    status: "upcoming" as const,
  }
];

const fallbackMetrics = [
  {
    id: "1",
    label: "Stakeholder Interviews",
    value: "32",
    target: "50",
    icon: "message-square",
    color: "bg-blue-500"
  },
  {
    id: "2", 
    label: "Survey Responses",
    value: "127",
    target: "200",
    icon: "users",
    color: "bg-indigo-500"
  },
  {
    id: "3",
    label: "Research Hours",
    value: "240",
    target: "400",
    icon: "clock",
    color: "bg-purple-500"
  },
  {
    id: "4",
    label: "Personas Created",
    value: "3",
    target: "5",
    icon: "target",
    color: "bg-blue-600"
  }
];

const MarketResearchPhase = () => {
  useScrollToTop();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      <Header />
      
      {/* Hero Section with Research/Analytics Image */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-blue-900/85 to-indigo-900/85" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
            <BookOpen className="w-5 h-5 mr-2" />
            <span className="font-semibold">Phase 1 • Foundation Research</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Market Research & Validation
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-white/90 mb-8 leading-relaxed">
            Understanding diaspora needs, motivations, and behaviors to validate DNA's concept and market fit through comprehensive research.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button className="bg-blue-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-600 transition-colors">
              Join Research Community
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors">
              View Progress
            </button>
          </div>
        </div>
      </section>

      {/* Research Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Research First?</h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Before building DNA, we're investing deeply in understanding the African diaspora's needs, challenges, and aspirations. 
              This research-first approach ensures we create a platform that truly serves our community, not just what we think they need. 
              Every feature, every interaction, every decision will be grounded in real insights from real people.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Deep Research</h3>
              <p className="text-gray-600 text-sm">AI-powered analysis of diaspora trends, behaviors, and market dynamics.</p>
            </div>
            
            <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Stakeholder Voices</h3>
              <p className="text-gray-600 text-sm">50+ interviews with diaspora leaders, entrepreneurs, and community builders.</p>
            </div>
            
            <div className="text-center p-6 bg-indigo-50 rounded-xl border border-indigo-200">
              <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Analysis</h3>
              <p className="text-gray-600 text-sm">Quantitative validation of market size, opportunities, and growth potential.</p>
            </div>
            
            <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Validation</h3>
              <p className="text-gray-600 text-sm">Testing our core assumptions and refining our platform concept.</p>
            </div>
          </div>
        </div>
      </section>

      <PhaseObjectives objectives={objectives} color="blue-600" />
      <PhaseTimeline milestones={timeline} color="indigo-600" />
      <PhaseMetrics phaseSlug="market-research" fallbackMetrics={fallbackMetrics} />
      
      {/* Research Community CTA */}
      <section className="py-16 bg-gradient-to-r from-slate-500/10 via-blue-500/10 to-indigo-500/10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-slate-200">
            <Search className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Help Shape DNA Through Research
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Your voice matters in building a platform that truly serves the African diaspora. Join our research community 
              to share your experiences, insights, and vision for how we can better strengthen our global network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors">
                Participate in Research
              </button>
              <button className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors">
                View Research Updates
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default MarketResearchPhase;
