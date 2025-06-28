
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Database, 
  Crown, 
  TestTube, 
  Calendar,
  Building2,
  MessageCircle,
  UserCheck,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TestingDashboard = () => {
  const navigate = useNavigate();

  const testingFeatures = [
    {
      title: "Profile Switcher",
      description: "Switch between test profiles to experience different user perspectives",
      icon: <Crown className="w-6 h-6" />,
      color: "bg-dna-gold",
      route: "/admin/profile-switcher",
      status: "Ready"
    },
    {
      title: "Data Seeder",
      description: "Manage test data - professionals, communities, and events",
      icon: <Database className="w-6 h-6" />,
      color: "bg-dna-emerald",
      route: "/admin/data-seeder",
      status: "Active"
    },
    {
      title: "Member Directory",
      description: "Browse all professionals and test connection features",
      icon: <Users className="w-6 h-6" />,
      color: "bg-dna-copper",
      route: "/members",
      status: "Ready"
    },
    {
      title: "Communities",
      description: "Explore communities and test joining/creating features",
      icon: <Building2 className="w-6 h-6" />,
      color: "bg-dna-forest",
      route: "/connect",
      status: "Ready"
    },
    {
      title: "Events",
      description: "Browse events and test registration/creation features",
      icon: <Calendar className="w-6 h-6" />,
      color: "bg-dna-mint",
      route: "/connect",
      status: "Ready"
    },
    {
      title: "Social Feed",
      description: "Test the social posting and interaction features",
      icon: <MessageCircle className="w-6 h-6" />,
      color: "bg-dna-coral",
      route: "/social",
      status: "Ready"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
          <TestTube className="w-10 h-10 text-dna-emerald" />
          DNA Testing Dashboard
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Welcome to your comprehensive testing environment. Use these tools to experience the DNA platform from different user perspectives and test all interactive features.
        </p>
      </div>

      {/* Quick Start Guide */}
      <Card className="border-dna-emerald border-2 bg-gradient-to-r from-dna-emerald/5 to-dna-mint/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-dna-forest">
            <UserCheck className="w-6 h-6" />
            Quick Start Testing Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-dna-emerald rounded-full flex items-center justify-center text-white font-bold">1</div>
              <div>
                <p className="font-semibold text-dna-forest">Seed Test Data</p>
                <p className="text-sm text-gray-600">Generate professionals, communities & events</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-dna-copper rounded-full flex items-center justify-center text-white font-bold">2</div>
              <div>
                <p className="font-semibold text-dna-forest">Switch Profile</p>
                <p className="text-sm text-gray-600">Experience platform as different users</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-dna-gold rounded-full flex items-center justify-center text-white font-bold">3</div>
              <div>
                <p className="font-semibold text-dna-forest">Test Features</p>
                <p className="text-sm text-gray-600">Interact with communities, events & members</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testing Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testingFeatures.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${feature.color} text-white`}>
                  {feature.icon}
                </div>
                <Badge 
                  variant={feature.status === 'Ready' ? 'default' : 'secondary'}
                  className={feature.status === 'Ready' ? 'bg-green-500' : 'bg-blue-500'}
                >
                  {feature.status}
                </Badge>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
              
              <Button 
                onClick={() => navigate(feature.route)}
                className="w-full bg-dna-forest hover:bg-dna-emerald text-white"
              >
                Open Feature
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Testing Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-dna-forest">Testing Tips & Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-dna-forest mb-2">Profile Testing</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Switch between mentor and investor profiles</li>
                <li>• Test different locations and expertise areas</li>
                <li>• Experience the platform from various perspectives</li>
                <li>• Always reset to your real profile when done</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-dna-forest mb-2">Feature Testing</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Test connection requests between profiles</li>
                <li>• Join different communities and events</li>
                <li>• Create posts and interact with content</li>
                <li>• Test messaging and notification features</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestingDashboard;
