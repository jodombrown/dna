
import React, { useState } from 'react';
import PhaseObjectives from '@/components/phases/PhaseObjectives';
import PhaseTimeline from '@/components/phases/PhaseTimeline';
import PhaseMetrics from '@/components/phases/PhaseMetrics';
import { Rocket, Code, Users, Target, TrendingUp, CheckCircle, Lightbulb, Settings, ArrowRight } from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BetaSignupDialog from '@/components/auth/BetaSignupDialog';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { useNavigate } from 'react-router-dom';
import PhaseHero from '@/components/phases/PhaseHero';

const objectives = [
  {
    icon: <Code className="w-5 h-5" />,
    title: "Core Platform Development",
    description: "Build the foundational DNA platform enabling authentic diaspora connections, collaborative project discovery, and purposeful contribution pathways. We're creating a robust infrastructure that scales beautifully while maintaining the personal touch our community values in professional relationships.",
    status: "Planned",
    completion: 0
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Community-Centered User Experience",
    description: "Implement seamless user journeys that reflect how African professionals naturally network and collaborate. Every feature prioritizes genuine relationship-building over superficial connections, with intuitive flows that respect cultural communication preferences and professional hierarchies.",
    status: "Planned",
    completion: 0
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Quality Assurance & Performance Excellence",
    description: "Execute comprehensive testing protocols ensuring platform reliability, security, and optimal performance across diverse global networks. We're building trust through technical excellence, with rigorous validation processes that guarantee a premium user experience for our community.",
    status: "Planned",
    completion: 0
  },
];

const timeline = [
  {
    quarter: "Mar 2026",
    title: "Foundation & Authentication Systems",
    items: [
      "Deploy scalable backend architecture optimized for global diaspora communities",
      "Implement secure authentication with multi-cultural name support and regional preferences",
      "Build comprehensive profile systems reflecting diverse African professional backgrounds",
      "Establish real-time messaging infrastructure supporting multiple languages and time zones"
    ],
    status: "upcoming" as const,
  },
  {
    quarter: "Apr-May 2026",
    title: "Core Feature Implementation & Integration",
    items: [
      "Launch Connect features enabling authentic professional relationship building",
      "Deploy Collaborate tools for cross-border project discovery and team formation",
      "Implement Contribute pathways matching skills with high-impact opportunities",
      "Integrate advanced search capabilities with cultural and professional context awareness"
    ],
    status: "upcoming" as const,
  },
  {
    quarter: "Jun-Jul 2026",
    title: "Excellence Validation & Launch Preparation",
    items: [
      "Execute extensive integration testing with real diaspora user scenarios",
      "Optimize platform performance for global accessibility and mobile-first usage",
      "Complete security audits and implement enterprise-grade protection measures",
      "Finalize deployment infrastructure with comprehensive monitoring and support systems"
    ],
    status: "upcoming" as const,
  }
];

const fallbackMetrics = [
  {
    id: "1",
    label: "Features Delivered",
    value: "0",
    target: "30",
    icon: "code",
    color: "bg-dna-copper"
  },
  {
    id: "2", 
    label: "Alpha Community",
    value: "0",
    target: "100",
    icon: "users",
    color: "bg-dna-gold"
  },
  {
    id: "3",
    label: "Test Scenarios",
    value: "0",
    target: "200",
    icon: "target",
    color: "bg-dna-emerald"
  },
  {
    id: "4",
    label: "Performance Score",
    value: "0",
    target: "95",
    icon: "zap",
    color: "bg-dna-forest"
  }
];

const MvpPhase = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const [isBetaSignupOpen, setIsBetaSignupOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10 flex flex-col">
      <Header />
      
      <PhaseHero
        badge="Phase 4 • MVP Build"
        title="MVP Build"
        description="Transforming validated designs into a powerful platform that enables authentic diaspora connections, meaningful collaborations, and purposeful contributions to Africa's development."
        prevPhase={{ label: "Previous Phase", url: "/phase/customer-discovery" }}
        nextPhase={{ label: "Next Phase", url: "/phase/beta-validation" }}
        gradient="relative bg-gradient-to-r from-dna-forest/90 via-dna-emerald/90 to-dna-copper/90 bg-[url('https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center before:absolute before:inset-0 before:bg-gradient-to-r before:from-dna-forest/80 before:via-dna-emerald/80 before:to-dna-copper/80 before:z-0"
      />

      {/* MVP Development Overview */}
      <section className="py-12 md:py-16 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Where Vision Becomes Reality</h2>
            <p className="text-base md:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed px-4">
              This phase transforms months of research, design, and validation into a living platform that serves our community. 
              We're building more than software—we're creating a digital home where African diaspora professionals can authentically 
              connect, collaborate on projects that matter, and channel their skills toward transforming the continent. 
              Every line of code reflects our community's values and aspirations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 px-4 lg:px-16 max-w-6xl mx-auto">
            <div className="text-center p-6 md:p-8 bg-gradient-to-br from-dna-mint/20 to-dna-emerald/20 rounded-2xl border border-dna-emerald/30">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-dna-emerald to-dna-forest rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                <Code className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">Platform Foundation</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">Building robust systems that scale gracefully while maintaining the personal touch our community values in professional relationships.</p>
            </div>
            
            <div className="text-center p-6 md:p-8 bg-gradient-to-br from-dna-emerald/20 to-dna-copper/20 rounded-2xl border border-dna-copper/30">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-dna-emerald to-dna-copper rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">Community-First Features</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">Implementing tools that facilitate genuine professional relationships and collaborative opportunities across the diaspora.</p>
            </div>
            
            <div className="text-center p-6 md:p-8 bg-gradient-to-br from-dna-copper/20 to-dna-gold/20 rounded-2xl border border-dna-gold/30">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-dna-copper to-dna-gold rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                <Target className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">Excellence Standards</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">Ensuring platform reliability, security, and performance that instills confidence in our global professional community.</p>
            </div>
          </div>
        </div>
      </section>

      <PhaseObjectives objectives={objectives} color="dna-emerald" />
      <PhaseTimeline milestones={timeline} color="dna-copper" />
      <PhaseMetrics phaseSlug="mvp" fallbackMetrics={fallbackMetrics} />
      
      {/* Alpha Testing CTA */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-dna-mint/20 via-dna-emerald/10 to-dna-copper/20">
        <div className="w-full text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-12 border border-dna-mint/30 max-w-4xl mx-auto">
            <Lightbulb className="w-12 h-12 md:w-16 md:h-16 text-dna-emerald mx-auto mb-4 md:mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
              Pioneer DNA's Development Journey
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 leading-relaxed px-4">
              Become part of our alpha testing community and experience DNA as we build it. Your real-world usage and insights 
              help us refine features that truly serve diaspora professionals, ensuring we launch with a platform that exceeds 
              expectations for networking, collaboration, and community impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-md mx-auto">
              <button 
                onClick={() => setIsBetaSignupOpen(true)}
                className="bg-dna-emerald text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full font-semibold hover:bg-dna-forest transition-colors text-sm md:text-base"
              >
                Join Alpha Testing
              </button>
              <button className="border-2 border-dna-emerald text-dna-emerald px-6 md:px-8 py-2.5 md:py-3 rounded-full font-semibold hover:bg-dna-emerald/10 transition-colors text-sm md:text-base">
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
