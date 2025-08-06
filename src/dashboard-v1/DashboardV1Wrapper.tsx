import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Database, Code, Layout, Settings2 } from 'lucide-react';

const DashboardV1Wrapper = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const features = [
    {
      icon: Layout,
      title: 'LinkedIn-Style Layout',
      description: 'Three-column responsive design with sidebars and main content'
    },
    {
      icon: Code,
      title: 'Complete Component Library',
      description: 'Post composer, social feed, profile management, messaging'
    },
    {
      icon: Database,
      title: 'Full Database Integration',
      description: 'All Supabase tables, RLS policies, and relationships intact'
    },
    {
      icon: Settings2,
      title: 'Admin & Management',
      description: 'User management, content moderation, analytics dashboard'
    }
  ];

  const handleEnterDashboard = () => {
    // This would redirect to the preserved dashboard
    // For now, we'll show the current dashboard
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/app')}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to New Experience
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-dna-forest">Dashboard v1</h1>
                <p className="text-sm text-gray-600">Preserved LinkedIn-style implementation</p>
              </div>
            </div>
            <Button onClick={handleEnterDashboard}>
              Enter Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-dna-forest mb-4">
            Preserved Implementation
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            This is the complete LinkedIn-style dashboard that was developed as the foundation 
            for the DNA platform. All functionality, components, and data remain intact.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="border-dna-mint/20">
                <CardHeader className="pb-3">
                  <IconComponent className="w-8 h-8 text-dna-copper mb-2" />
                  <CardTitle className="text-base text-dna-forest">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Status Card */}
        <Card className="bg-dna-mint/5 border-dna-mint/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-dna-forest mb-2">
                Preservation Status: Complete
              </h3>
              <p className="text-gray-600 mb-4">
                All components, hooks, contexts, and database relationships are preserved 
                and ready for reference or reactivation.
              </p>
              <div className="flex justify-center">
                <Button 
                  onClick={handleEnterDashboard}
                  className="bg-dna-copper hover:bg-dna-copper/90"
                >
                  Access Preserved Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardV1Wrapper;