
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, DollarSign, Users, TrendingUp, Calendar, MapPin, CheckCircle, Info, PieChart, Clock, Target } from 'lucide-react';
import FeedbackPanel from '@/components/FeedbackPanel';
import Footer from '@/components/Footer';

const ContributeExample = () => {
  const navigate = useNavigate();
  const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const contributionOpportunities = [
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
      urgency: "High"
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
      urgency: "Medium"
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
      urgency: "Low"
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 hover:bg-dna-mint"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="border-l border-gray-300 h-6 hidden sm:block"></div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Contribute to Africa</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Make a lasting impact</p>
              </div>
            </div>
            <Badge className="bg-dna-gold text-white text-xs sm:text-sm">
              $2.1M+ Raised
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

        {/* Contribution Opportunities */}
        <div className="mb-8">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Active Contribution Opportunities</h3>
          <div className="space-y-6">
            {contributionOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base sm:text-lg mb-2">{opportunity.title}</CardTitle>
                      <p className="text-sm sm:text-base text-gray-600">{opportunity.description}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Badge 
                        className={`${
                          opportunity.urgency === 'High' ? 'bg-red-100 text-red-800' :
                          opportunity.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        } text-xs`}
                      >
                        {opportunity.urgency} Priority
                      </Badge>
                      <Badge variant="outline" className="text-xs">{opportunity.type}</Badge>
                    </div>
                  </div>
                  <Badge className="w-fit bg-dna-emerald/20 text-dna-emerald text-xs">
                    {opportunity.category}
                  </Badge>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        ${opportunity.currentAmount.toLocaleString()} / ${opportunity.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{opportunity.contributors} contributors</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{opportunity.timeLeft} remaining</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Funding Progress</span>
                      <span className="font-medium">
                        {Math.round((opportunity.currentAmount / opportunity.targetAmount) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(opportunity.currentAmount / opportunity.targetAmount) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="bg-dna-emerald/10 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-dna-emerald" />
                      <span className="text-sm font-medium text-dna-emerald">
                        Projected Impact: {opportunity.impactMetric}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button className="flex-1 bg-dna-emerald hover:bg-dna-forest text-white">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Contribute Now
                    </Button>
                    <Button variant="outline">
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
      
      <FeedbackPanel 
        isOpen={isFeedbackPanelOpen}
        onClose={() => setIsFeedbackPanelOpen(false)}
        pageType="contribute"
      />
    </div>
  );
};

export default ContributeExample;
