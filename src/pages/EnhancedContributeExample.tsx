
import React, { useState, useEffect } from 'react';
import ContributePageLayout from '@/components/contribute/ContributePageLayout';
import ContributePrototypeNotice from '@/components/contribute/ContributePrototypeNotice';
import ContributeHeroSection from '@/components/contribute/ContributeHeroSection';
import PersonalImpactDashboard from '@/components/contribute/PersonalImpactDashboard';
import CommunityImpactMetrics from '@/components/contribute/CommunityImpactMetrics';
import EnhancedPathwaysGrid from '@/components/contribute/EnhancedPathwaysGrid';
import ContributionCardsGrid from '@/components/social/ContributionCardsGrid';
import ContributionCardCreator from '@/components/social/ContributionCardCreator';
import ReportsAccessPanel from '@/components/contribute/ReportsAccessPanel';
import FeedbackPanel from '@/components/FeedbackPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const EnhancedContributeExample = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = useState(false);
  const [isCreateOpportunityOpen, setIsCreateOpportunityOpen] = useState(false);
  const [isReportsDialogOpen, setIsReportsDialogOpen] = useState(false);
  const [isShareImpactOpen, setIsShareImpactOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCreateOpportunity = () => {
    setIsCreateOpportunityOpen(true);
  };

  const handleExploreOpportunities = () => {
    setActiveTab('opportunities');
  };

  const handleExplorePathway = (pathway: string) => {
    setActiveTab('opportunities');
    toast({
      title: "Pathway Filter Applied",
      description: `Showing opportunities for ${pathway} contributions`,
    });
  };

  const handleViewReports = () => {
    setIsReportsDialogOpen(true);
  };

  const handleDownloadReport = (reportId: string) => {
    toast({
      title: "Report Download",
      description: "Report download will be available in the full platform",
    });
  };

  const handleShareImpact = () => {
    setIsShareImpactOpen(true);
  };

  const handleViewDetails = () => {
    toast({
      title: "Full Report",
      description: "Detailed impact analytics will be available in the full platform",
    });
  };

  return (
    <ContributePageLayout>
      <ContributePrototypeNotice />
      
      <ContributeHeroSection
        onCreateOpportunity={handleCreateOpportunity}
        onExploreOpportunities={handleExploreOpportunities}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="impact">My Impact</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-8">
          <CommunityImpactMetrics onViewReports={handleViewReports} />
          <EnhancedPathwaysGrid onExplorePathway={handleExplorePathway} />
        </TabsContent>

        <TabsContent value="impact" className="space-y-8">
          <PersonalImpactDashboard
            onShareImpact={handleShareImpact}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-8">
          <ContributionCardsGrid />
        </TabsContent>

        <TabsContent value="reports" className="space-y-8">
          <ReportsAccessPanel onDownloadReport={handleDownloadReport} />
        </TabsContent>
      </Tabs>

      {/* Create Opportunity Dialog */}
      <Dialog open={isCreateOpportunityOpen} onOpenChange={setIsCreateOpportunityOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Contribution Opportunity</DialogTitle>
          </DialogHeader>
          <ContributionCardCreator />
        </DialogContent>
      </Dialog>

      {/* Reports Dialog */}
      <Dialog open={isReportsDialogOpen} onOpenChange={setIsReportsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Impact Reports & Analytics</DialogTitle>
          </DialogHeader>
          <ReportsAccessPanel onDownloadReport={handleDownloadReport} />
        </DialogContent>
      </Dialog>

      {/* Share Impact Dialog */}
      <Dialog open={isShareImpactOpen} onOpenChange={setIsShareImpactOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Impact</DialogTitle>
          </DialogHeader>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 mb-4">
                Social sharing features will be available in the full platform. 
                Share your contributions with the community and inspire others to take action.
              </p>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      <FeedbackPanel 
        isOpen={isFeedbackPanelOpen}
        onClose={() => setIsFeedbackPanelOpen(false)}
        pageType="contribute"
      />
    </ContributePageLayout>
  );
};

export default EnhancedContributeExample;
