
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, DollarSign, Clock, Users, TrendingUp, Target, PieChart } from 'lucide-react';

const ContributeExample = () => {
  const navigate = useNavigate();

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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Contribution Hub</h1>
                <p className="text-gray-600">Make impact through capital, skills, and time</p>
              </div>
            </div>
            <Badge className="bg-dna-emerald text-white">
              Impact Score: {myContributions.impactScore}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Your Impact Dashboard */}
        <Card className="mb-8 bg-gradient-to-r from-dna-emerald/10 to-dna-copper/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-dna-emerald" />
              Your Impact Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-dna-emerald mb-2">
                  ${myContributions.totalContributed.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Contributed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-dna-copper mb-2">
                  {myContributions.livesImpacted}
                </div>
                <div className="text-sm text-gray-600">Lives Impacted</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-dna-forest mb-2">
                  {myContributions.projectsFunded}
                </div>
                <div className="text-sm text-gray-600">Projects Funded</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-dna-gold mb-2">
                  {myContributions.impactScore}%
                </div>
                <div className="text-sm text-gray-600">Impact Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Impact Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Your Contribution Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {impactCategories.map((category, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm text-gray-600">${category.amount.toLocaleString()}</span>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contribution Opportunities */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Active Contribution Opportunities</h3>
          <div className="space-y-6">
            {contributionOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg mb-2">{opportunity.title}</CardTitle>
                      <p className="text-gray-600">{opportunity.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge 
                        className={`${
                          opportunity.urgency === 'High' ? 'bg-red-100 text-red-800' :
                          opportunity.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}
                      >
                        {opportunity.urgency} Priority
                      </Badge>
                      <Badge variant="outline">{opportunity.type}</Badge>
                    </div>
                  </div>
                  <Badge className="w-fit bg-dna-emerald/20 text-dna-emerald">
                    {opportunity.category}
                  </Badge>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
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
                  
                  <div className="flex gap-3 pt-2">
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
            <CardTitle>Multiple Ways to Make Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-dna-emerald rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold mb-2">Financial Investment</h4>
                <p className="text-sm text-gray-600">Direct funding for high-impact projects with transparent tracking</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-dna-copper rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold mb-2">Skills & Expertise</h4>
                <p className="text-sm text-gray-600">Volunteer your professional skills to support project development</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-dna-forest rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold mb-2">Time & Mentorship</h4>
                <p className="text-sm text-gray-600">Share knowledge and mentor emerging leaders and entrepreneurs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ContributeExample;
