
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  MessageSquare, 
  BarChart3, 
  Target, 
  Calendar,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  Search,
  UserCheck
} from 'lucide-react';
import SurveyDialog from '@/components/survey/SurveyDialog';
import FeedbackPanel from '@/components/FeedbackPanel';
import { useNavigate } from 'react-router-dom';

const CustomerDiscoveryPhase = () => {
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = useState(false);
  const navigate = useNavigate();

  const objectives = [
    {
      icon: <Search className="w-5 h-5" />,
      title: "Market Research & Validation",
      description: "Conduct comprehensive research to understand diaspora needs, pain points, and existing solutions",
      status: "In Progress",
      completion: 75
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Community Engagement",
      description: "Build relationships with diaspora communities, organizations, and key stakeholders worldwide",
      status: "Active",
      completion: 60
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "User Interviews & Feedback",
      description: "Gather insights through surveys, interviews, and focus groups with potential users",
      status: "Ongoing",
      completion: 85
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "Problem-Solution Fit",
      description: "Validate that our platform addresses real problems faced by the diaspora community",
      status: "Analysis",
      completion: 45
    }
  ];

  const milestones = [
    {
      quarter: "Q3 2025",
      title: "Research Foundation",
      items: [
        "Complete 500+ user surveys",
        "Conduct 100+ stakeholder interviews", 
        "Map diaspora ecosystem globally",
        "Identify key pain points and opportunities"
      ],
      status: "active"
    },
    {
      quarter: "Q4 2025", 
      title: "Validation & Refinement",
      items: [
        "Validate problem-solution fit",
        "Refine platform concept based on feedback",
        "Build strategic partnerships",
        "Finalize MVP requirements"
      ],
      status: "upcoming"
    }
  ];

  const metrics = [
    { label: "User Surveys Completed", value: "347", target: "500", color: "bg-dna-emerald" },
    { label: "Stakeholder Interviews", value: "73", target: "100", color: "bg-dna-copper" },
    { label: "Community Partners", value: "28", target: "50", color: "bg-dna-gold" },
    { label: "Countries Researched", value: "15", target: "25", color: "bg-dna-forest" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      {/* HERO */}
      <section className="py-16 bg-gradient-to-br from-dna-emerald to-dna-forest text-white text-center flex flex-col justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-block mb-6">
            <span className="bg-white/90 text-dna-emerald font-semibold px-6 py-2 rounded-full shadow text-base">Phase 1 of 5</span>
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">Customer Discovery Phase</h1>
          <p className="text-xl max-w-3xl mx-auto text-white/90 mb-10">
            Deep-diving into the African diaspora ecosystem to understand needs, validate our approach, and build the foundation for a platform that truly serves our community.
          </p>
          {/* Nav Buttons */}
          <div className="flex justify-center gap-4 mt-6 flex-wrap">
            <Button 
              onClick={() => navigate('/mvp-phase')}
              variant="outline"
              className="bg-white text-dna-emerald border-white hover:bg-gray-50 font-medium px-6 py-3 text-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Previous: MVP Phase
            </Button>
            <Button 
              onClick={() => navigate('/go-to-market-phase')}
              className="bg-dna-copper hover:bg-dna-gold text-white font-medium px-6 py-3 text-lg"
            >
              Next: Go-to-Market Phase
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>
      {/* OBJECTIVES */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Phase Objectives</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our focused approach to understanding and validating the diaspora community's needs
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {objectives.map((objective, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-dna-emerald">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-dna-emerald/10 rounded-lg flex items-center justify-center text-dna-emerald">
                      {objective.icon}
                    </div>
                    {objective.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{objective.description}</p>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="border-dna-emerald text-dna-emerald">
                      {objective.status}
                    </Badge>
                    <span className="text-sm font-medium text-gray-700">{objective.completion}%</span>
                  </div>
                  <Progress value={objective.completion} className="h-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* TIMELINE */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Phase Timeline</h2>
            <p className="text-lg text-gray-600">
              Key milestones and deliverables across our customer discovery journey
            </p>
          </div>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <Card 
                key={index} 
                className={`hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${
                  milestone.status === 'active' ? 'border-l-4 border-l-dna-copper bg-dna-copper/5' : 'border-l-4 border-l-gray-300'
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={milestone.status === 'active' ? 'bg-dna-copper' : 'bg-gray-500'}>
                          {milestone.quarter}
                        </Badge>
                        {milestone.status === 'active' && (
                          <Badge variant="outline" className="border-dna-copper text-dna-copper">
                            Current Phase
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">{milestone.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                      {milestone.status === 'active' && (
                        <div className="w-3 h-3 bg-dna-copper rounded-full animate-pulse"></div>
                      )}
                      <span className="text-sm font-medium text-gray-600 capitalize">
                        {milestone.status === 'active' ? 'In Progress' : 'Upcoming'}
                      </span>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {milestone.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
                        <CheckCircle className={`w-5 h-5 ${milestone.status === 'active' ? 'text-dna-copper' : 'text-gray-400'}`} />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* METRICS */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Progress Metrics</h2>
            <p className="text-lg text-gray-600">
              Real-time tracking of our customer discovery efforts
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-6 text-center">
                  <div className={`w-12 h-12 ${metric.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
                  <div className="text-sm text-gray-500 mb-2">of {metric.target} target</div>
                  <div className="text-sm font-medium text-gray-700">{metric.label}</div>
                  <Progress 
                    value={(parseInt(metric.value) / parseInt(metric.target)) * 100} 
                    className="h-2 mt-3"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-dna-emerald/10 to-dna-copper/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <Lightbulb className="w-16 h-16 text-dna-copper mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Help Shape the Future of Diaspora Connection
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Your insights are crucial to building a platform that truly serves our community. 
              Join our research efforts and be part of the solution.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setIsSurveyOpen(true)}
              className="bg-dna-copper hover:bg-dna-gold text-white px-8 py-3 text-lg flex items-center gap-2 hover:shadow-lg transition-all"
            >
              Take Our Survey
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button 
              onClick={() => setIsFeedbackPanelOpen(true)}
              variant="outline"
              className="border-2 border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white px-8 py-3 text-lg flex items-center gap-2 hover:shadow-lg transition-all"
            >
              Share Feedback
              <MessageSquare className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>
      <SurveyDialog 
        isOpen={isSurveyOpen} 
        onClose={() => setIsSurveyOpen(false)} 
      />
      <FeedbackPanel 
        isOpen={isFeedbackPanelOpen}
        onClose={() => setIsFeedbackPanelOpen(false)}
        pageType="contribute"
      />
      <Footer />
    </div>
  );
};

export default CustomerDiscoveryPhase;
