
import React, { useState } from 'react';
import PhaseObjectives from '@/components/phases/PhaseObjectives';
import PhaseTimeline from '@/components/phases/PhaseTimeline';
import PhaseMetrics from '@/components/phases/PhaseMetrics';
import { Users, Code, Target, CheckCircle, BarChart3, Lightbulb, Palette, Zap, ArrowRight } from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BetaSignupDialog from '@/components/auth/BetaSignupDialog';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { useNavigate } from 'react-router-dom';

const objectives = [
  {
    icon: <Code className="w-5 h-5" />,
    title: "Interactive Product Experience Creation",
    description: "Design and build comprehensive wireframes, interactive prototypes, and user experience flows that bring the DNA platform concept to life. This involves creating clickable prototypes that stakeholders can actually experience and provide meaningful feedback on, ensuring we validate the user experience before investing in full development.",
    status: "Upcoming",
    completion: 0
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Comprehensive Usability Testing",
    description: "Conduct systematic usability testing sessions with 10-20 diverse participants from our target diaspora community. Identify friction points, navigation issues, and areas of confusion while gathering detailed feedback on feature prioritization, user flows, and overall platform experience to optimize before development.",
    status: "Planned",
    completion: 0
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "AI-Powered Feature Prioritization",
    description: "Utilize advanced AI analysis to process user feedback, testing data, and business impact metrics to create a data-driven feature prioritization framework. This ensures we build the most valuable features first and create a development roadmap that maximizes user value and platform success.",
    status: "Planned",
    completion: 0
  },
];

const timeline = [
  {
    quarter: "Oct 2025",
    title: "Design Foundation & Wireframing",
    items: [
      "AI-assisted wireframe creation for all core platform features and user flows",
      "Comprehensive design system development with brand guidelines and components",
      "Detailed user flow mapping for Connect, Collaborate, and Contribute pillars",
      "Interactive prototype framework setup using Figma and modern design tools"
    ],
    status: "upcoming" as const,
  },
  {
    quarter: "Nov 2025",
    title: "Interactive Prototype Development",
    items: [
      "Full interactive prototype creation with realistic user interactions and flows",
      "Clickable prototype deployment for stakeholder testing and feedback collection",
      "Feature interaction testing with core community members and early adopters",
      "User testing session preparation with detailed testing scripts and scenarios"
    ],
    status: "upcoming" as const,
  },
  {
    quarter: "Dec 2025",
    title: "Testing, Analysis & Roadmap Refinement",
    items: [
      "10-20 structured usability tests with comprehensive friction point identification",
      "AI-powered analysis of user feedback and behavioral data for feature prioritization",
      "Detailed usability report compilation with actionable insights and recommendations",
      "Updated product roadmap creation with validated features and development timeline"
    ],
    status: "upcoming" as const,
  }
];

const fallbackMetrics = [
  {
    id: "1",
    label: "Wireframes Created",
    value: "0",
    target: "25",
    icon: "code",
    color: "bg-orange-500"
  },
  {
    id: "2", 
    label: "Usability Tests",
    value: "0",
    target: "20",
    icon: "users",
    color: "bg-amber-500"
  },
  {
    id: "3",
    label: "Prototype Iterations",
    value: "0",
    target: "5",
    icon: "target",
    color: "bg-yellow-500"
  },
  {
    id: "4",
    label: "Feature Priorities",
    value: "0",
    target: "15",
    icon: "star",
    color: "bg-orange-600"
  }
];

const PrototypingPhase = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const [isBetaSignupOpen, setIsBetaSignupOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col">
      <Header />
      
      {/* Hero Section with Design/Prototyping Image */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/85 via-orange-900/85 to-yellow-900/85" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
            <Palette className="w-5 h-5 mr-2" />
            <span className="font-semibold">Phase 2 • Design & Prototyping</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Design & Prototyping
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-white/90 mb-8 leading-relaxed">
            Creating and testing the product experience through interactive prototypes and comprehensive usability testing before building the full platform.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button 
              onClick={() => setIsBetaSignupOpen(true)}
              className="bg-white text-orange-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Join Testing Community
            </button>
            <button 
              onClick={() => navigate('/customer-discovery-phase')}
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors flex items-center"
            >
              Next Phase
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Prototyping Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Design Before Development</h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              This phase transforms our research insights into tangible, testable experiences. We're creating interactive prototypes 
              that let our community actually experience DNA before we build it. Every button, every flow, every interaction is 
              designed with intention and tested with real users to ensure we create something truly valuable for the African diaspora.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Interactive Design</h3>
              <p className="text-gray-600 leading-relaxed">Creating wireframes and interactive prototypes that bring the DNA vision to life with realistic user experiences and flows tailored for diaspora professionals.</p>
            </div>
            
            <div className="text-center p-8 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border border-orange-200">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">User Testing</h3>
              <p className="text-gray-600 leading-relaxed">Comprehensive usability testing with diaspora community members to identify friction points and optimize user experience across cultural contexts.</p>
            </div>
            
            <div className="text-center p-8 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl border border-yellow-200">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Optimization</h3>
              <p className="text-gray-600 leading-relaxed">Leveraging AI to analyze user feedback and prioritize features based on impact, usability, and community value for maximum diaspora engagement.</p>
            </div>
          </div>
        </div>
      </section>

      <PhaseObjectives objectives={objectives} color="orange-600" />
      <PhaseTimeline milestones={timeline} color="amber-600" />
      <PhaseMetrics phaseSlug="prototyping" fallbackMetrics={fallbackMetrics} />
      
      {/* Design Community CTA */}
      <section className="py-16 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-orange-200">
            <Lightbulb className="w-16 h-16 text-orange-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Shape DNA Through Design Testing
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Join our design testing community to experience DNA prototypes firsthand and provide crucial feedback that shapes 
              the platform's user experience. Your insights help us create intuitive, culturally-relevant interfaces that truly 
              serve the African diaspora community's networking and collaboration needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setIsBetaSignupOpen(true)}
                className="bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors"
              >
                Join Design Testing
              </button>
              <button className="border-2 border-orange-500 text-orange-500 px-8 py-3 rounded-full font-semibold hover:bg-orange-50 transition-colors">
                View Design Updates
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
