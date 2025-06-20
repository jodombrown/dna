
import React, { useState } from 'react';
import PhaseObjectives from '@/components/phases/PhaseObjectives';
import PhaseTimeline from '@/components/phases/PhaseTimeline';
import PhaseMetrics from '@/components/phases/PhaseMetrics';
import { Code, Users, Target, Zap, Database, Settings, Lightbulb, Rocket, ArrowRight } from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BetaSignupDialog from '@/components/auth/BetaSignupDialog';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { useNavigate } from 'react-router-dom';

const objectives = [
  {
    icon: <Code className="w-5 h-5" />,
    title: "Core Platform Development",
    description: "Build the foundational DNA platform with essential features for connecting, collaborating, and contributing. This includes user authentication, profile management, basic messaging, and the core infrastructure needed to support our three pillars across the African diaspora community.",
    status: "Planned",
    completion: 0
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "User Experience Implementation",
    description: "Implement intuitive user flows and interfaces based on our prototyping and testing insights. Create seamless experiences for diaspora professionals to discover opportunities, build meaningful connections, and engage with projects that align with their skills and interests.",
    status: "Planned",
    completion: 0
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Feature Integration & Testing",
    description: "Integrate all core features into a cohesive platform experience and conduct comprehensive testing to ensure reliability, performance, and user satisfaction. This includes system integration testing, user acceptance testing, and performance optimization for launch readiness.",
    status: "Planned",
    completion: 0
  },
];

const timeline = [
  {
    quarter: "Mar 2026",
    title: "Core Development & Infrastructure",
    items: [
      "Complete backend architecture and database design for scalable user management",
      "Implement user authentication, profile creation, and core account management features",
      "Build foundational Connect features for diaspora networking and community discovery",
      "Develop basic messaging and notification systems for platform communication"
    ],
    status: "upcoming" as const,
  },
  {
    quarter: "Apr-May 2026",
    title: "Feature Development & Integration",
    items: [
      "Implement Collaborate features for project discovery and team formation",
      "Build Contribute features for opportunity matching and impact tracking",
      "Create comprehensive search and filtering capabilities across all platform features",
      "Develop admin dashboard and content management systems for platform governance"
    ],
    status: "upcoming" as const,
  },
  {
    quarter: "Jun-Jul 2026",
    title: "Testing, Optimization & Launch Preparation",
    items: [
      "Conduct comprehensive system integration testing and bug resolution",
      "Implement performance optimization and security hardening measures",
      "Complete user acceptance testing with select community members",
      "Finalize launch preparation with deployment infrastructure and monitoring systems"
    ],
    status: "upcoming" as const,
  }
];

const fallbackMetrics = [
  {
    id: "1",
    label: "Features Built",
    value: "0",
    target: "30",
    icon: "code",
    color: "bg-red-500"
  },
  {
    id: "2", 
    label: "Alpha Testers",
    value: "0",
    target: "100",
    icon: "users",
    color: "bg-pink-500"
  },
  {
    id: "3",
    label: "Test Cases",
    value: "0",
    target: "200",
    icon: "target",
    color: "bg-rose-500"
  },
  {
    id: "4",
    label: "Performance Score",
    value: "0",
    target: "95",
    icon: "zap",
    color: "bg-red-600"
  }
];

const MvpPhase = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const [isBetaSignupOpen, setIsBetaSignupOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 flex flex-col">
      <Header />
      
      {/* Hero Section with Development/Building Image */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/85 via-pink-900/85 to-rose-900/85" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
            <Rocket className="w-5 h-5 mr-2" />
            <span className="font-semibold">Phase 4 • MVP Development</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Minimal Viable Product (MVP)
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-white/90 mb-8 leading-relaxed">
            Building the core DNA platform with essential features for diaspora networking, collaboration, and contribution, validated through comprehensive testing and user feedback.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button 
              onClick={() => setIsBetaSignupOpen(true)}
              className="bg-white text-red-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Join Alpha Testing
            </button>
            <button 
              onClick={() => navigate('/beta-validation-phase')}
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors flex items-center"
            >
              Next Phase
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* MVP Development Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Building the Foundation</h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              This phase transforms our validated designs and research into a working platform. We're building the core DNA experience 
              that enables diaspora professionals to connect meaningfully, collaborate on impactful projects, and contribute their skills 
              to initiatives that strengthen Africa's development. Every feature is purposefully designed to serve our community's unique needs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border border-red-200">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Core Development</h3>
              <p className="text-gray-600 leading-relaxed">Building robust backend systems and user-friendly interfaces that support authentic diaspora networking and collaboration at scale.</p>
            </div>
            
            <div className="text-center p-8 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-200">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">User Experience</h3>
              <p className="text-gray-600 leading-relaxed">Implementing intuitive user flows that make it easy for diaspora professionals to discover opportunities and build meaningful connections.</p>
            </div>
            
            <div className="text-center p-8 bg-gradient-to-br from-rose-50 to-red-50 rounded-2xl border border-rose-200">
              <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality Assurance</h3>
              <p className="text-gray-600 leading-relaxed">Comprehensive testing and optimization to ensure platform reliability, performance, and user satisfaction before launch.</p>
            </div>
          </div>
        </div>
      </section>

      <PhaseObjectives objectives={objectives} color="red-600" />
      <PhaseTimeline milestones={timeline} color="pink-600" />
      <PhaseMetrics phaseSlug="mvp" fallbackMetrics={fallbackMetrics} />
      
      {/* Alpha Testing CTA */}
      <section className="py-16 bg-gradient-to-r from-red-500/10 via-pink-500/10 to-rose-500/10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-red-200">
            <Lightbulb className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Help Us Build DNA Together
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Join our alpha testing community to be among the first to experience the DNA platform as we build it. 
              Your feedback helps us create features that truly serve the African diaspora's networking and collaboration needs, 
              ensuring we launch with a platform that adds real value to your professional journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setIsBetaSignupOpen(true)}
                className="bg-red-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-red-600 transition-colors"
              >
                Join Alpha Testing
              </button>
              <button className="border-2 border-red-500 text-red-500 px-8 py-3 rounded-full font-semibold hover:bg-red-50 transition-colors">
                View Development Updates
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

export default MvpPhase;
