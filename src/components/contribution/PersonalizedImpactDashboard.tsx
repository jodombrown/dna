
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Heart, 
  Users, 
  Target, 
  Calendar, 
  Award,
  Share2,
  Eye,
  ArrowUpRight
} from 'lucide-react';

const PersonalizedImpactDashboard = () => {
  const userMetrics = {
    totalContributed: 127000,
    projectsSupported: 23,
    livesImpacted: 847,
    hoursVolunteered: 156,
    connectionsMatched: 12,
    impactScore: 94,
    currentStreak: 6,
    monthlyGoal: 5000,
    monthlyProgress: 3200
  };

  const pathwayBreakdown = [
    { pathway: 'Financial Investment', amount: 85000, percentage: 67, color: 'bg-green-500' },
    { pathway: 'Skills & Expertise', amount: 25000, percentage: 20, color: 'bg-blue-500' },
    { pathway: 'Time & Volunteering', amount: 12000, percentage: 9, color: 'bg-purple-500' },
    { pathway: 'Network & Connections', amount: 5000, percentage: 4, color: 'bg-orange-500' }
  ];

  const recentContributions = [
    {
      id: 1,
      title: 'Solar Education Initiative',
      amount: '$15,000',
      type: 'funding',
      date: '2 days ago',
      impact: '+120 students reached',
      status: 'active'
    },
    {
      id: 2,
      title: 'FinTech Platform Development',
      amount: '8 hours',
      type: 'skills',
      date: '1 week ago',
      impact: 'MVP launched successfully',
      status: 'completed'
    },
    {
      id: 3,
      title: 'AgriTech Startup Introduction',
      amount: '1 connection',
      type: 'network',
      date: '2 weeks ago',
      impact: 'Partnership secured',
      status: 'completed'
    }
  ];

  const achievements = [
    { title: 'Impact Pioneer', description: 'First to fund 3+ projects', icon: '🏆', unlocked: true },
    { title: 'Community Builder', description: '10+ network connections', icon: '🤝', unlocked: true },
    { title: 'Consistent Contributor', description: '6 months active', icon: '⭐', unlocked: true },
    { title: 'Major Investor', description: '$100K+ contributed', icon: '💎', unlocked: false }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Impact Journey</h2>
          <p className="text-gray-600">Track your contributions and see the difference you're making</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share Impact
          </Button>
          <Button className="bg-dna-emerald hover:bg-dna-forest text-white">
            <Eye className="w-4 h-4 mr-2" />
            View Full Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-dna-emerald/10 to-dna-mint/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-dna-emerald" />
              <Badge className="bg-dna-emerald/20 text-dna-emerald">
                Score: {userMetrics.impactScore}/100
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              ${userMetrics.totalContributed.toLocaleString()}
            </h3>
            <p className="text-gray-600">Total Contributed</p>
            <div className="mt-2">
              <Progress value={userMetrics.impactScore} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-dna-copper" />
              <Badge variant="outline">{userMetrics.projectsSupported}</Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {userMetrics.livesImpacted.toLocaleString()}
            </h3>
            <p className="text-gray-600">Lives Impacted</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-dna-gold" />
              <Badge variant="outline">{userMetrics.connectionsMatched}</Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {userMetrics.hoursVolunteered}h
            </h3>
            <p className="text-gray-600">Hours Volunteered</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Heart className="w-8 h-8 text-red-500" />
              <Badge className="bg-red-100 text-red-800">
                {userMetrics.currentStreak} months
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {userMetrics.projectsSupported}
            </h3>
            <p className="text-gray-600">Projects Supported</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly Goal Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-dna-emerald" />
              Monthly Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-medium">
                  ${userMetrics.monthlyProgress.toLocaleString()} / ${userMetrics.monthlyGoal.toLocaleString()}
                </span>
              </div>
              <Progress 
                value={(userMetrics.monthlyProgress / userMetrics.monthlyGoal) * 100} 
                className="h-3"
              />
              <p className="text-sm text-gray-600">
                {Math.round((userMetrics.monthlyProgress / userMetrics.monthlyGoal) * 100)}% of monthly goal achieved
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pathway Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Contribution Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pathwayBreakdown.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.pathway}</span>
                    <span>${item.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-dna-gold" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    achievement.unlocked ? 'bg-dna-emerald/10' : 'bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <h4 className={`font-semibold text-sm ${
                      achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {achievement.title}
                    </h4>
                    <p className={`text-xs ${
                      achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.unlocked && (
                    <Badge className="bg-dna-emerald text-white text-xs">
                      Unlocked
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-dna-emerald" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentContributions.map((contribution) => (
              <div key={contribution.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{contribution.title}</h4>
                  <p className="text-sm text-gray-600">{contribution.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-dna-emerald">{contribution.amount}</p>
                  <p className="text-sm text-green-600">{contribution.impact}</p>
                </div>
                <Badge 
                  variant={contribution.status === 'active' ? 'default' : 'secondary'}
                  className="ml-4"
                >
                  {contribution.status}
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button variant="outline">
              View All Activity
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalizedImpactDashboard;
