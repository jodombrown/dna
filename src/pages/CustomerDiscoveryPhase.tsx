import React, { useState } from 'react';
import PhaseObjectives from '@/components/phases/PhaseObjectives';
import PhaseTimeline from '@/components/phases/PhaseTimeline';
import PhaseMetrics from '@/components/phases/PhaseMetrics';
import { Users, MessageSquare, TrendingUp, Target, Globe, Heart, Lightbulb, UserCheck, ArrowRight } from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BetaSignupDialog from '@/components/auth/BetaSignupDialog';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { useNavigate } from 'react-router-dom';

const objectives = [
  {
    icon: <Heart className="w-5 h-5" />,
    title: "Early Adopter Interest Validation",
    description: "Measure and validate early adopter interest through strategic outreach campaigns, landing page conversions, and community engagement metrics. This phase focuses on understanding who our most passionate early supporters are and what drives their engagement with the DNA vision across different diaspora communities.",
    status: "Planned",
    completion: 0
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "DNA Founders Circle Community",
    description: "Launch and nurture the DNA Founders Circle as our core community of early supporters, beta testers, and platform ambassadors. Build authentic relationships with diaspora leaders, entrepreneurs, and changemakers who can help shape the platform's development and initial user base through their expertise and networks.",
    status: "Planned",
    completion: 0
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: "Problem-Solution Fit Validation",
    description: "Conduct in-depth problem-oriented interviews to validate our core assumptions about diaspora challenges and needs. Refine our understanding of user pain points, desired solutions, and the specific ways DNA can create meaningful value for connecting, collaborating, and contributing across the African diaspora ecosystem.",
    status: "Planned",
    completion: 0
  },
];

const timeline = [
  {
    quarter: "Jan 2026",
    title: "Landing Page & Strategic Outreach",
    items: [
      "Launch A/B tested landing page with early bird membership offers",
      "Deploy targeted social media campaigns across diaspora communities",
      "Begin structured problem-oriented interviews with key stakeholders",
      "Implement advanced analytics tracking for user behavior insights"
    ],
    status: "upcoming" as const,
  },
  {
    quarter: "Feb 2026",
    title: "Community Building & Validation",
    items: [
      "Launch DNA Founders Circle on WhatsApp/Slack with exclusive content",
      "Host virtual community engagement events and feedback sessions",
      "Compile comprehensive interview summaries and insights reports",
      "Analyze landing page performance and optimize conversion funnels"
    ],
    status: "upcoming" as const,
  }
];

const fallbackMetrics = [
  {
    id: "1",
    label: "Landing Page Visitors",
    value: "0",
    target: "5000",
    icon: "globe",
    color: "bg-emerald-500"
  },
  {
    id: "2", 
    label: "Early Bird Sign-ups",
    value: "0",
    target: "500",
    icon: "users",
    color: "bg-teal-500"
  },
  {
    id: "3",
    label: "Founder Circle Members",
    value: "0",
    target: "100",
    icon: "heart",
    color: "bg-cyan-500"
  },
  {
    id: "4",
    label: "Problem Interviews",
    value: "0",
    target: "50",
    icon: "message-square",
    color: "bg-green-600"
  }
];

const CustomerDiscoveryPhase = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const [isBetaSignupOpen, setIsBetaSignupOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col">
      <Header />
      
      {/* Hero Section with Community Discovery Image */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/85 via-teal-900/85 to-cyan-900/85" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
            <UserCheck className="w-5 h-5 mr-2" />
            <span className="font-semibold">Phase 3 • Customer Discovery</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Customer Discovery
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-white/90 mb-8 leading-relaxed">
            Measuring early adopter interest and validation without product build through community engagement and targeted outreach across the diaspora.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button 
              onClick={() => setIsBetaSignupOpen(true)}
              className="bg-white text-emerald-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Join Founders Circle
            </button>
            <button 
              onClick={() => navigate('/mvp-phase')}
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors flex items-center"
            >
              Next Phase
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Phase Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What is Customer Discovery?</h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              This phase is about understanding our community before building. We're measuring genuine interest from the African diaspora, 
              validating our assumptions about their networking and collaboration needs, and building relationships with early adopters who will help shape DNA's future. 
              Rather than building first and hoping for users, we're listening first and building with purpose to strengthen global diaspora connections.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Interest Validation</h3>
              <p className="text-gray-600 leading-relaxed">Measuring authentic engagement from diaspora communities through strategic outreach, landing page optimization, and early bird membership validation.</p>
            </div>
            
            <div className="text-center p-8 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border border-teal-200">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Community Building</h3>
              <p className="text-gray-600 leading-relaxed">Creating the DNA Founders Circle as our core community of early supporters, platform ambassadors, and diaspora thought leaders.</p>
            </div>
            
            <div className="text-center p-8 bg-gradient-to-br from-cyan-50 to-emerald-50 rounded-2xl border border-cyan-200">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Problem Validation</h3>
              <p className="text-gray-600 leading-relaxed">Deep-dive interviews to validate our understanding of diaspora challenges and refine our solution approach for maximum community impact.</p>
            </div>
          </div>
        </div>
      </section>

      <PhaseObjectives objectives={objectives} color="emerald-600" />
      <PhaseTimeline milestones={timeline} color="teal-600" />
      <PhaseMetrics phaseSlug="customer-discovery" fallbackMetrics={fallbackMetrics} />
      
      {/* Community Engagement CTA */}
      <section className="py-16 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-emerald-200">
            <Lightbulb className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Join the DNA Founders Circle
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Be part of our founding community and help shape the future of diaspora networking. 
              Get exclusive access to our development process, early features, and direct input on platform decisions that will strengthen African diaspora connections globally.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setIsBetaSignupOpen(true)}
                className="bg-emerald-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-emerald-600 transition-colors"
              >
                Apply to Join Circle
              </button>
              <button className="border-2 border-emerald-500 text-emerald-500 px-8 py-3 rounded-full font-semibold hover:bg-emerald-50 transition-colors">
                Learn About Benefits
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

export default CustomerDiscoveryPhase;
