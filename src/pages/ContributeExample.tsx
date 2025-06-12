import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, Clock, Users, TrendingUp, Info, Heart, Target, Lightbulb, PieChart, CheckCircle } from 'lucide-react';
import FeedbackPanel from '@/components/FeedbackPanel';
import Footer from '@/components/Footer';
import BackButtonDropdown from '@/components/header/BackButtonDropdown';

const ContributeExample = () => {
  const navigate = useNavigate();
  const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = useState(false);
  const [isInvestDialogOpen, setIsInvestDialogOpen] = useState(false);
  const [isVolunteerDialogOpen, setIsVolunteerDialogOpen] = useState(false);
  const [isMentorDialogOpen, setIsMentorDialogOpen] = useState(false);
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const contributionPathways = [
    {
      id: 1,
      title: "Solar Education Initiative",
      description: "Bringing renewable energy education to rural schools",
      type: "Financial Investment",
      targetAmount: 500000,
      currentAmount: 385000,
      contributors: 45,
      timeLeft: "23 days",
      impactMetric: "15,000 students reached",
      category: "Education & Energy",
      urgency: "High",
      detailedDescription: "This initiative focuses on establishing solar energy education programs in rural schools across Kenya and Nigeria. We partner with local educators to develop curriculum and install demonstration solar panels that serve both as learning tools and practical energy sources for the schools.",
      goals: [
        "Install solar education labs in 50 rural schools",
        "Train 200 teachers in renewable energy curriculum",
        "Provide hands-on learning for 15,000 students",
        "Create sustainable energy sources for school operations"
      ],
      timeline: "12-month implementation with quarterly milestones",
      partnership: "Working with local education ministries and renewable energy companies"
    },
    {
      id: 2,
      title: "Telemedicine Platform Development",
      description: "Healthcare access for remote African communities",
      type: "Skills Contribution",
      targetAmount: 300000,
      currentAmount: 180000,
      contributors: 28,
      timeLeft: "45 days",
      impactMetric: "50,000 patients served",
      category: "Healthcare Technology",
      urgency: "Medium",
      detailedDescription: "A comprehensive telemedicine platform connecting diaspora healthcare professionals with patients in remote African communities. The platform includes video consultations, digital health records, and mobile health units for areas with limited internet connectivity.",
      goals: [
        "Connect 500+ diaspora doctors with remote communities",
        "Serve 50,000 patients in first year",
        "Establish 20 mobile health unit partnerships",
        "Create multilingual health education resources"
      ],
      timeline: "18-month development and deployment phase",
      partnership: "Collaborating with African Medical Association and local health ministries"
    },
    {
      id: 3,
      title: "Agricultural Supply Chain Optimization",
      description: "Blockchain-based transparency for farmers",
      type: "Time & Expertise",
      targetAmount: 750000,
      currentAmount: 520000,
      contributors: 67,
      timeLeft: "67 days",
      impactMetric: "5,000 farmers supported",
      category: "Agriculture & Tech",
      urgency: "Low",
      detailedDescription: "A blockchain-powered platform that creates transparency in agricultural supply chains, ensuring farmers receive fair prices while providing consumers with traceability of their food sources. This system reduces middleman exploitation and increases farmer income.",
      goals: [
        "Onboard 5,000 farmers across 5 countries",
        "Establish direct market connections",
        "Implement blockchain tracking for crop-to-consumer journey",
        "Increase farmer income by average 40%"
      ],
      timeline: "24-month rollout with pilot programs in Ghana and Nigeria",
      partnership: "Working with agricultural cooperatives and fintech companies"
    }
  ];

  const myContributions = {
    totalContributed: 127000,
    livesImpacted: 847,
    projectsFunded: 23,
    impactScore: 94
  };

  const impactCategories = [
    { name: "Education", percentage: 35, amount: 44450 },
    { name: "Healthcare", percentage: 28, amount: 35560 },
    { name: "Agriculture", percentage: 22, amount: 27940 },
    { name: "Technology", percentage: 15, amount: 19050 }
  ];

  const handleLearnMore = (pathway: any) => {
    setSelectedPathway(pathway);
    setIsLearnMoreOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <BackButtonDropdown currentPage="Contribute" />
              <div className="border-l border-gray-300 h-6 hidden sm:block"></div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Contribution Hub</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Make your impact across Africa</p>
              </div>
            </div>
            <Badge className="bg-dna-emerald text-white text-xs sm:text-sm">
              Active
            </Badge>
          </div>
        </div>
      </header>

      {/* Prototype Stage Notice */}
      <div className="bg-gradient-to-r from-dna-gold/10 to-dna-emerald/10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-dna-gold mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Platform Preview - Prototype Stage</h3>
              <p className="text-sm text-gray-700">
                This is a preview of our Contribute experience! The impact initiatives and contribution methods shown below represent our vision for how diaspora members will give back to Africa and track their impact. This prototype showcases the giving platform we're building to facilitate meaningful contributions to African development.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Impact Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-xl sm:text-2xl font-bold text-dna-gold mb-1 sm:mb-2">$2.1M</div>
              <div className="text-xs sm:text-sm text-gray-600">Total Contributions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-xl sm:text-2xl font-bold text-dna-emerald mb-1 sm:mb-2">1,250</div>
              <div className="text-xs sm:text-sm text-gray-600">Active Contributors</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-xl sm:text-2xl font-bold text-dna-copper mb-1 sm:mb-2">45</div>
              <div className="text-xs sm:text-sm text-gray-600">Countries Reached</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-xl sm:text-2xl font-bold text-dna-forest mb-1 sm:mb-2">89K</div>
              <div className="text-xs sm:text-sm text-gray-600">Lives Impacted</div>
            </CardContent>
          </Card>
        </div>

        {/* Your Impact Dashboard */}
        <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-dna-emerald/10 to-dna-copper/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Heart className="w-5 h-5 text-dna-emerald" />
              Your Impact Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-xl sm:text-3xl font-bold text-dna-emerald mb-1 sm:mb-2">
                  ${myContributions.totalContributed.toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Total Contributed</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-3xl font-bold text-dna-copper mb-1 sm:mb-2">
                  {myContributions.livesImpacted}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Lives Impacted</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-3xl font-bold text-dna-forest mb-1 sm:mb-2">
                  {myContributions.projectsFunded}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Projects Funded</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-3xl font-bold text-dna-gold mb-1 sm:mb-2">
                  {myContributions.impactScore}%
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Impact Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Impact Breakdown */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <PieChart className="w-5 h-5" />
              Your Contribution Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {impactCategories.map((category, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm sm:text-base">{category.name}</span>
                    <span className="text-xs sm:text-sm text-gray-600">${category.amount.toLocaleString()}</span>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Contribution Pathways */}
        <div className="mb-8">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Active Contribution Pathways</h3>
          <div className="space-y-6">
            {contributionPathways.map((pathway) => (
              <Card key={pathway.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base sm:text-lg mb-2">{pathway.title}</CardTitle>
                      <p className="text-sm sm:text-base text-gray-600">{pathway.description}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Badge 
                        className={`${
                          pathway.urgency === 'High' ? 'bg-red-100 text-red-800' :
                          pathway.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        } text-xs`}
                      >
                        {pathway.urgency} Priority
                      </Badge>
                      <Badge variant="outline" className="text-xs">{pathway.type}</Badge>
                    </div>
                  </div>
                  <Badge className="w-fit bg-dna-emerald/20 text-dna-emerald text-xs">
                    {pathway.category}
                  </Badge>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        ${pathway.currentAmount.toLocaleString()} / ${pathway.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{pathway.contributors} contributors</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{pathway.timeLeft} remaining</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Funding Progress</span>
                      <span className="font-medium">
                        {Math.round((pathway.currentAmount / pathway.targetAmount) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(pathway.currentAmount / pathway.targetAmount) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="bg-dna-emerald/10 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-dna-emerald" />
                      <span className="text-sm font-medium text-dna-emerald">
                        Projected Impact: {pathway.impactMetric}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button 
                      onClick={() => setIsInvestDialogOpen(true)}
                      className="flex-1 bg-dna-emerald hover:bg-dna-forest text-white"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Contribute Now
                    </Button>
                    <Button 
                      onClick={() => handleLearnMore(pathway)}
                      variant="outline"
                    >
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Ways to Contribute */}
        <Card className="bg-gradient-to-r from-dna-copper/10 to-dna-emerald/10">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Multiple Ways to Make Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-dna-emerald rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Financial Investment</h4>
                <p className="text-xs sm:text-sm text-gray-600">Direct funding for high-impact projects with transparent tracking</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-dna-copper rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Skills & Expertise</h4>
                <p className="text-xs sm:text-sm text-gray-600">Volunteer your professional skills to support project development</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-dna-forest rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Time & Mentorship</h4>
                <p className="text-xs sm:text-sm text-gray-600">Share knowledge and mentor emerging leaders and entrepreneurs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="mt-8 bg-gradient-to-r from-dna-gold/10 to-dna-emerald/10">
          <CardContent className="p-6 sm:p-8 text-center">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              Have Ideas for New Ways to Contribute?
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Help us create more meaningful ways for the diaspora to give back to Africa.
            </p>
            <Button 
              onClick={() => setIsFeedbackPanelOpen(true)}
              className="bg-dna-gold hover:bg-dna-copper text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Share Your Contribution Ideas
            </Button>
          </CardContent>
        </Card>
      </main>

      <Footer />
      
      {/* Contribute Now Dialog */}
      <Dialog open={isInvestDialogOpen} onOpenChange={setIsInvestDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-dna-emerald" />
              How We Envision Contributing
            </DialogTitle>
            <DialogDescription className="text-left space-y-4 pt-4">
              <p>
                In our fully built platform, clicking "Contribute Now" will take you through a seamless process where you can:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Choose your contribution type (financial, skills, or time)</li>
                <li>Set up secure payment processing for financial contributions</li>
                <li>Connect with project coordinators for skills-based volunteering</li>
                <li>Schedule time commitments that fit your availability</li>
                <li>Track your impact in real-time through detailed analytics</li>
                <li>Join project-specific communication channels</li>
              </ul>
              <p className="text-sm text-gray-600 bg-dna-emerald/10 p-3 rounded">
                This is our vision for how contribution will work. We're building this experience to be as seamless and impactful as possible.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setIsInvestDialogOpen(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Learn More Sheet */}
      <Sheet open={isLearnMoreOpen} onOpenChange={setIsLearnMoreOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedPathway && (
            <>
              <SheetHeader className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-dna-emerald/10 rounded-lg">
                    <Target className="w-6 h-6 text-dna-emerald" />
                  </div>
                  <Badge className="bg-dna-emerald text-white">
                    {selectedPathway.category}
                  </Badge>
                </div>
                <SheetTitle className="text-2xl text-gray-900">{selectedPathway.title}</SheetTitle>
                <SheetDescription className="text-base text-gray-600">
                  {selectedPathway.detailedDescription}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Goals</h3>
                  <ul className="space-y-2">
                    {selectedPathway.goals.map((goal: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-dna-emerald mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Timeline</h3>
                  <p className="text-gray-700">{selectedPathway.timeline}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Partnership Approach</h3>
                  <p className="text-gray-700">{selectedPathway.partnership}</p>
                </div>

                <div className="bg-gradient-to-r from-dna-emerald/5 to-dna-copper/5 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Current Progress</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Funding Progress</span>
                      <span className="font-medium">
                        {Math.round((selectedPathway.currentAmount / selectedPathway.targetAmount) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(selectedPathway.currentAmount / selectedPathway.targetAmount) * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>${selectedPathway.currentAmount.toLocaleString()} raised</span>
                      <span>{selectedPathway.contributors} contributors</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      
      <FeedbackPanel 
        isOpen={isFeedbackPanelOpen}
        onClose={() => setIsFeedbackPanelOpen(false)}
        pageType="contribute"
      />
    </div>
  );
};

export default ContributeExample;
