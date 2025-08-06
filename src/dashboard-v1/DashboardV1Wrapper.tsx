import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Database, Code, Layout, Settings2 } from 'lucide-react';
import { useMobile } from '@/hooks/useMobile';
import Logo from '@/components/header/Logo';
import { MobileButton, MobileLayout } from '@/components/mobile';

const DashboardV1Wrapper = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { isMobile } = useMobile();

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
    // Navigate to the actual v1 dashboard experience
    navigate('/app/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <MobileLayout variant="padded" spacing="sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Logo />
              {!isMobile && (
                <div>
                  <h1 className="text-2xl font-bold text-dna-forest">Dashboard v1</h1>
                  <p className="text-sm text-gray-600">Preserved LinkedIn-style implementation</p>
                </div>
              )}
            </div>
            <MobileButton 
              onClick={handleEnterDashboard}
              size={isMobile ? "sm" : "default"}
              className="bg-dna-copper hover:bg-dna-copper/90 text-white"
            >
              {isMobile ? "Enter" : "Enter Dashboard"}
            </MobileButton>
          </div>
        </MobileLayout>
      </div>

      {/* Content */}
      <MobileLayout variant="padded" spacing="lg">
        <div className="text-center mb-8">
          <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-dna-forest mb-4`}>
            DNA Platform v1
          </h2>
          <p className={`${isMobile ? 'text-base' : 'text-lg'} text-gray-600 max-w-3xl mx-auto`}>
            Complete LinkedIn-style dashboard with full functionality for team review and reflection.
          </p>
        </div>

        {/* Features Grid */}
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'md:grid-cols-2 lg:grid-cols-4 gap-6'} mb-8`}>
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

        {/* Access Card */}
        <Card className="bg-dna-mint/5 border-dna-mint/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-dna-forest mb-2">
                Ready for Review
              </h3>
              <p className="text-gray-600 mb-4">
                Access the full v1 dashboard with all features and functionality intact.
              </p>
              <div className="flex justify-center">
                <MobileButton 
                  onClick={handleEnterDashboard}
                  className="bg-dna-copper hover:bg-dna-copper/90 text-white"
                  fullWidth={isMobile}
                >
                  Access Dashboard v1
                </MobileButton>
              </div>
            </div>
          </CardContent>
        </Card>
      </MobileLayout>
    </div>
  );
};

export default DashboardV1Wrapper;