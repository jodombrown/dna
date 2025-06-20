
import React, { useState } from 'react';
import PhaseObjectives from '@/components/phases/PhaseObjectives';
import PhaseTimeline from '@/components/phases/PhaseTimeline';
import PhaseMetrics from '@/components/phases/PhaseMetrics';
import { Users, BarChart3, MessageSquare, Target, TrendingUp, CheckCircle, Shield, Rocket, ArrowRight } from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BetaSignupDialog from '@/components/auth/BetaSignupDialog';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { useNavigate } from 'react-router-dom';

const objectives = [
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "MVP Performance & Product-Market Fit Validation",
    description: "Comprehensively validate our MVP's performance metrics, user retention rates, engagement patterns, and overall product-market fit through systematic beta testing with 200-500 carefully selected users. Measure key performance indicators, user satisfaction scores, and platform adoption rates to ensure we're ready for public launch.",
    status: "Planned",
    completion: 0
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Beta Community Engagement & Feedback Loop",
    description: "Build and nurture a highly engaged beta user community that provides continuous feedback, reports issues, and helps refine the platform experience. Track user engagement patterns, feature adoption, satisfaction scores, and community health metrics to optimize for long-term user success and platform stickiness.",
    status: "Planned",
    completion: 0
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Monetization Strategy & Revenue Model Validation",
    description: "Test and validate our monetization strategies, pricing models, and revenue generation approaches with real user behavior data. Experiment with different pricing tiers, premium features, and partnership revenue streams to establish a sustainable and scalable business model that serves our community while generating growth capital.",
    status: "Planned",
    completion: 0
  },
];

const timeline = [
  {
    quarter: "Aug 2026",
    title: "Beta Launch & User Onboarding Optimization",
    items: [
      "Controlled beta launch with 200-500 carefully selected diaspora community members",
      "Advanced user onboarding process optimization with personalized experience flows",
      "AI-powered cohort tracking system implementation for detailed user behavior analysis",
      "Comprehensive usage analytics dashboard creation for real-time performance monitoring"
    ],
    status: "upcoming" as const,
  }
];

const fallbackMetrics = [
  {
    id: "1",
    label: "Beta Users",
    value: "0",
    target: "500",
    icon: "users",
    color: "bg-purple-500"
  },
  {
    id: "2", 
    label: "NPS Score",
    value: "0",
    target: "50",
    icon: "thumbs-up",
    color: "bg-violet-500"
  },
  {
    id: "3",
    label: "Usage Reports",
    value: "0",
    target: "20",
    icon: "bar-chart",
    color: "bg-fuchsia-500"
  },
  {
    id: "4",
    label: "Feedback Sessions",
    value: "0",
    target: "25",
    icon: "message-square",
    color: "bg-purple-600"
  }
];

const BetaValidationPhase = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const [isBetaSignupOpen, setIsBetaSignupOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 flex flex-col">
      <Header />
      
      {/* Hero Section with Beta Testing Image */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/85 via-violet-900/85 to-fuchsia-900/85" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
            <Shield className="w-5 h-5 mr-2" />
            <span className="font-semibold">Phase 5 • Beta Validation</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Beta Validation
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-white/90 mb-8 leading-relaxed">
            Validating MVP performance, retention, and monetization readiness through comprehensive beta testing with real users from the diaspora community.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button 
              onClick={() => setIsBetaSignupOpen(true)}
              className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Apply for Beta
            </button>
            <button 
              onClick={() => navigate('/go-to-market-phase')}
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors flex items-center"
            >
              Next Phase
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Beta Testing Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Real Users, Real Validation</h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              This is where DNA meets reality. Our beta phase puts the platform in the hands of 200-500 real users from the 
              African diaspora community. We're not just testing features - we're validating our entire vision, measuring 
              real engagement, and ensuring we've built something that truly adds value to people's lives and professional networks.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real Users</h3>
              <p className="text-gray-600 text-sm">500 beta testers from across the diaspora community testing real scenarios.</p>
            </div>
            
            <div className="text-center p-6 bg-violet-50 rounded-xl border border-violet-200">
              <div className="w-12 h-12 bg-violet-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Metrics</h3>
              <p className="text-gray-600 text-sm">Comprehensive tracking of user engagement, retention, and satisfaction.</p>
            </div>
            
            <div className="text-center p-6 bg-fuchsia-50 rounded-xl border border-fuchsia-200">
              <div className="w-12 h-12 bg-fuchsia-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibull text-gray-900 mb-2">Monetization Testing</h3>
              <p className="text-gray-600 text-sm">Validating revenue models and pricing strategies with real user data.</p>
            </div>
            
            <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-300">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Launch Readiness</h3>
              <p className="text-gray-600 text-sm">Ensuring platform stability and user experience before public launch.</p>
            </div>
          </div>
        </div>
      </section>

      <PhaseObjectives objectives={objectives} color="purple-600" />
      <PhaseTimeline milestones={timeline} color="violet-600" />
      <PhaseMetrics phaseSlug="beta-validation" fallbackMetrics={fallbackMetrics} />
      
      {/* Beta Community CTA */}
      <section className="py-16 bg-gradient-to-r from-purple-500/10 via-violet-500/10 to-fuchsia-500/10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-purple-200">
            <CheckCircle className="w-16 h-16 text-purple-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Join Our Beta Testing Community
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Be among the first to experience DNA and help us perfect the platform before public launch. Beta testers get 
              exclusive access, direct input on features, and the opportunity to shape the future of diaspora networking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setIsBetaSignupOpen(true)}
                className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors"
              >
                Apply for Beta Access
              </button>
              <button className="border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-purple-50 transition-colors">
                Learn About Beta Program
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

export default BetaValidationPhase;
