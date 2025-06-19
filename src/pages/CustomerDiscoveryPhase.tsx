
import React from 'react';
import PhaseHero from '@/components/phases/PhaseHero';
import PhaseObjectives from '@/components/phases/PhaseObjectives';
import PhaseTimeline from '@/components/phases/PhaseTimeline';
import PhaseMetrics from '@/components/phases/PhaseMetrics';
import { Users, MessageSquare, TrendingUp, Target, Globe, Heart, Lightbulb, UserCheck } from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const objectives = [
  {
    icon: <Heart className="w-5 h-5" />,
    title: "Early Adopter Interest Validation",
    description: "Measure and validate early adopter interest through strategic outreach campaigns, landing page conversions, and community engagement metrics. This phase focuses on understanding who our most passionate early supporters are and what drives their engagement with the DNA vision.",
    status: "Planned",
    completion: 0
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "DNA Founders Circle Community",
    description: "Launch and nurture the DNA Founders Circle as our core community of early supporters, beta testers, and platform ambassadors. Build authentic relationships with diaspora leaders, entrepreneurs, and changemakers who can help shape the platform's development and initial user base.",
    status: "Planned",
    completion: 0
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: "Problem-Solution Fit Validation",
    description: "Conduct in-depth problem-oriented interviews to validate our core assumptions about diaspora challenges and needs. Refine our understanding of user pain points, desired solutions, and the specific ways DNA can create meaningful value for the African diaspora community.",
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col">
      <Header />
      
      {/* Hero Section with Community Discovery Image */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/90 via-teal-600/90 to-cyan-600/90" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
            <UserCheck className="w-5 h-5 mr-2" />
            <span className="font-semibold">Phase 3 • Customer Discovery #1</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Customer Discovery #1 (No MVP)
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-white/90 mb-8 leading-relaxed">
            Measuring early adopter interest and validation without product build through community engagement and targeted outreach.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button className="bg-white text-emerald-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
              Join Founders Circle
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Phase Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What is Customer Discovery #1?</h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              This phase is about understanding our community before building. We're measuring genuine interest from the African diaspora, 
              validating our assumptions about their needs, and building relationships with early adopters who will help shape DNA's future. 
              Rather than building first and hoping for users, we're listening first and building with purpose.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-emerald-50 rounded-xl">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Interest Validation</h3>
              <p className="text-gray-600">Measuring authentic engagement from diaspora communities through strategic outreach and landing page optimization.</p>
            </div>
            
            <div className="text-center p-6 bg-teal-50 rounded-xl">
              <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Building</h3>
              <p className="text-gray-600">Creating the DNA Founders Circle as our core community of early supporters and platform ambassadors.</p>
            </div>
            
            <div className="text-center p-6 bg-cyan-50 rounded-xl">
              <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Problem Validation</h3>
              <p className="text-gray-600">Deep-dive interviews to validate our understanding of diaspora challenges and refine our solution approach.</p>
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
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <Lightbulb className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Join the DNA Founders Circle
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Be part of our founding community and help shape the future of diaspora networking. 
              Get exclusive access to our development process, early features, and direct input on platform decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-emerald-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-emerald-600 transition-colors">
                Apply to Join Circle
              </button>
              <button className="border-2 border-emerald-500 text-emerald-500 px-8 py-3 rounded-full font-semibold hover:bg-emerald-50 transition-colors">
                Learn About Benefits
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default CustomerDiscoveryPhase;
