
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Heart, 
  Share2, 
  Award,
  Calendar,
  Users,
  Target,
  ArrowUpRight
} from 'lucide-react';

interface PersonalImpactDashboardProps {
  onShareImpact: () => void;
  onViewDetails: () => void;
}

const PersonalImpactDashboard: React.FC<PersonalImpactDashboardProps> = ({
  onShareImpact,
  onViewDetails
}) => {
  const myContributions = {
    totalContributed: 127000,
    projectsSupported: 23,
    livesImpacted: 847,
    hoursVolunteered: 156,
    connectionsMatched: 12,
    impactScore: 94
  };

  const recentActivity = [
    {
      id: 1,
      type: 'funding',
      title: 'Solar Education Initiative',
      amount: '$15,000',
      date: '2 days ago',
      impact: '+120 students reached'
    },
    {
      id: 2,
      type: 'skills',
      title: 'FinTech Platform Development',
      amount: '8 hours',
      date: '1 week ago',
      impact: 'MVP launched successfully'
    },
    {
      id: 3,
      type: 'network',
      title: 'AgriTech Startup Introduction',
      amount: '1 connection',
      date: '2 weeks ago',
      impact: 'Partnership secured'
    }
  ];

  const achievements = [
    { title: 'Impact Pioneer', description: 'First to fund 3+ projects', icon: '🏆' },
    { title: 'Community Builder', description: '10+ network connections', icon: '🤝' },
    { title: 'Consistent Contributor', description: '6 months active', icon: '⭐' }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Impact Journey</h2>
        <div className="flex gap-3">
          <Button 
            onClick={onShareImpact}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share Impact
          </Button>
          <Button 
            onClick={onViewDetails}
            className="bg-dna-emerald hover:bg-dna-forest text-white"
          >
            View Full Report
            <ArrowUpRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-dna-emerald/10 to-dna-mint/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-dna-emerald" />
              <Badge className="bg-dna-emerald/20 text-dna-emerald">94/100</Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              ${myContributions.totalContributed.toLocaleString()}
            </h3>
            <p className="text-gray-600">Total Contributed</p>
            <Progress value={94} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-dna-copper" />
              <Badge variant="outline">{myContributions.projectsSupported}</Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {myContributions.livesImpacted.toLocaleString()}
            </h3>
            <p className="text-gray-600">Lives Impacted</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-dna-gold" />
              <Badge variant="outline">{myContributions.connectionsMatched}</Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {myContributions.hoursVolunteered}h
            </h3>
            <p className="text-gray-600">Hours Volunteered</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Heart className="w-8 h-8 text-red-500" />
              <Badge className="bg-red-100 text-red-800">Active</Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {myContributions.projectsSupported}
            </h3>
            <p className="text-gray-600">Projects Supported</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-dna-emerald" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                      <p className="text-sm text-gray-600">{activity.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-dna-emerald">{activity.amount}</p>
                      <p className="text-sm text-green-600">{activity.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-dna-gold" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{achievement.title}</h4>
                    <p className="text-xs text-gray-600">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              View All Achievements
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonalImpactDashboard;
