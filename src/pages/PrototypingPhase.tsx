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
    title: "User Experience Design & Prototyping",
    description: "Design intuitive user interfaces and interactive prototypes based on market research insights and user feedback validation. This phase focuses on creating wireframes, mockups, and clickable prototypes that demonstrate the core functionality and user flows of the DNA platform.",
    status: "Planned",
    completion: 0
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "User Feedback & Usability Testing",
    description: "Conduct user testing sessions with diaspora community members to gather feedback on the usability, desirability, and overall user experience of our prototypes. Iterate on our designs based on user insights to ensure the platform meets the needs and expectations of our target audience.",
    status: "Planned",
    completion: 0
  },
  {
    icon: <TestTube className="w-5 h-5" />,
    title: "Technical Feasibility & Validation",
    description: "Assess the technical feasibility of our proposed features and functionalities through rapid prototyping and experimentation. Validate our technology choices, identify potential challenges, and refine our technical approach to ensure we can deliver a scalable and reliable platform.",
    status: "Planned",
    completion: 0
  },
];

const timeline = [
  {
    quarter: "Oct 2025",
    title: "User Interface Design & Wireframing",
    items: [
      "Develop initial user interface designs and wireframes for core platform features",
      "Create interactive prototypes using Figma or similar design tools",
      "Conduct internal reviews and gather feedback from stakeholders",
      "Refine designs based on initial feedback and usability considerations"
    ],
    status: "upcoming" as const,
  },
  {
    quarter: "Nov-Dec 2025",
    title: "Usability Testing & Iteration",
    items: [
      "Recruit diaspora community members for user testing sessions",
      "Conduct remote and in-person usability testing of our prototypes",
      "Analyze user feedback and identify areas for improvement",
      "Iterate on our designs based on user insights and testing results"
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
    color: "bg-blue-500"
  },
  {
    id: "2", 
    label: "User Interviews",
    value: "0",
    target: "50",
    icon: "users",
    color: "bg-indigo-500"
  },
  {
    id: "3",
    label: "Usability Score",
    value: "0",
    target: "80",
    icon: "trending-up",
    color: "bg-purple-500"
  },
  {
    id: "4",
    label: "Prototype Tests",
    value: "0",
    target: "100",
    icon: "zap",
    color: "bg-blue-600"
  }
];

const PrototypingPhase = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const [isBetaSignupOpen, setIsBetaSignupOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      <Header />
      
      <PhaseHero
        badge="Phase 2 • Prototyping"
        title="Prototyping"
        description="Designing and testing user experiences, wireframes, and interactive prototypes based on market research insights and user feedback validation."
        prevPhase={{ label: "Previous Phase", url: "/phase-1" }}
        nextPhase={{ label: "Next Phase", url: "/phase-3" }}
        gradient="bg-gradient-to-r from-blue-900/85 via-indigo-900/85 to-purple-900/85"
      />

      {/* Phase Overview */}
      <section className="py-16 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">From Concept to Clickable</h2>
            <p className="text-lg text-gray-600 max-w-5xl mx-auto leading-relaxed">
              This phase is where ideas take shape. We're translating our market research and user insights into tangible designs, 
              wireframes, and interactive prototypes. By putting these prototypes in front of real users from the diaspora community, 
              we're able to validate our assumptions, refine our user experience, and ensure we're building a platform that truly meets their needs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 px-4 lg:px-16">
            <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">UI/UX Design</h3>
              <p className="text-gray-600 leading-relaxed">Crafting intuitive user interfaces and seamless experiences that make diaspora networking feel effortless and engaging.</p>
            </div>
            
            <div className="text-center p-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">User Feedback</h3>
              <p className="text-gray-600 leading-relaxed">Gathering continuous feedback from diaspora community members to ensure our designs resonate with their needs and preferences.</p>
            </div>
            
            <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-200">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TestTube className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Tech Validation</h3>
              <p className="text-gray-600 leading-relaxed">Validating the technical feasibility of our designs through rapid prototyping and experimentation to ensure a scalable platform.</p>
            </div>
          </div>
        </div>
      </section>

      <PhaseObjectives objectives={objectives} color="blue-600" />
      <PhaseTimeline milestones={timeline} color="indigo-600" />
      <PhaseMetrics phaseSlug="prototyping" fallbackMetrics={fallbackMetrics} />
      
      {/* Design Testing CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10">
        <div className="w-full text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-blue-200 max-w-5xl mx-auto">
            <Lightbulb className="w-16 h-16 text-blue-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Help Us Design the Future of DNA
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Join our design testing community and be among the first to experience and shape the DNA platform. 
              Your feedback will directly influence our user experience, ensuring we build a platform that truly serves the African diaspora's needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setIsBetaSignupOpen(true)}
                className="bg-blue-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-600 transition-colors"
              >
                Join Design Testing
              </button>
              <button className="border-2 border-blue-500 text-blue-500 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors">
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
