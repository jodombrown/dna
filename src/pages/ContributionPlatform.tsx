
import React, { useState, useEffect } from 'react';
import ContributePageLayout from '@/components/contribute/ContributePageLayout';
import ContributionCreationWizard from '@/components/contribution/ContributionCreationWizard';
import ContributionDiscoveryFeed from '@/components/contribution/ContributionDiscoveryFeed';
import PersonalizedImpactDashboard from '@/components/contribution/PersonalizedImpactDashboard';
import PathwaysEducationGrid from '@/components/contribution/PathwaysEducationGrid';
import ContributionEngagementPanel from '@/components/contribution/ContributionEngagementPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const ContributionPlatform = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);
  const [isSuggestPathwayOpen, setIsSuggestPathwayOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCreateContribution = () => {
    setIsCreateWizardOpen(true);
  };

  const handleSuggestPathway = () => {
    setIsSuggestPathwayOpen(true);
  };

  const handleContributionCreated = () => {
    setIsCreateWizardOpen(false);
    setActiveTab('my-impact');
    toast({
      title: "Contribution Created!",
      description: "Your contribution has been successfully added to the platform.",
    });
  };

  return (
    <ContributePageLayout>
      <div className="space-y-8">
        {/* Platform Header */}
        <div className="bg-gradient-to-br from-dna-emerald/10 via-dna-mint/5 to-dna-copper/10 rounded-3xl p-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              African Impact Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Create, discover, and amplify contributions that drive Africa's progress. 
              Join thousands of changemakers making real impact across the continent.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/70 backdrop-blur rounded-xl p-4">
                <div className="text-2xl font-bold text-dna-emerald">2,847</div>
                <div className="text-sm text-gray-600">Active Contributors</div>
              </div>
              <div className="bg-white/70 backdrop-blur rounded-xl p-4">
                <div className="text-2xl font-bold text-dna-copper">$4.2M</div>
                <div className="text-sm text-gray-600">Total Impact Created</div>
              </div>
              <div className="bg-white/70 backdrop-blur rounded-xl p-4">
                <div className="text-2xl font-bold text-dna-gold">847K</div>
                <div className="text-sm text-gray-600">Lives Impacted</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Platform Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="my-impact">My Impact</TabsTrigger>
            <TabsTrigger value="pathways">Pathways</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-8">
            <ContributionDiscoveryFeed 
              onCreateContribution={handleCreateContribution}
            />
          </TabsContent>

          <TabsContent value="create" className="space-y-8">
            <ContributionCreationWizard 
              onContributionCreated={handleContributionCreated}
            />
          </TabsContent>

          <TabsContent value="my-impact" className="space-y-8">
            <PersonalizedImpactDashboard />
          </TabsContent>

          <TabsContent value="pathways" className="space-y-8">
            <PathwaysEducationGrid 
              onSuggestPathway={handleSuggestPathway}
            />
          </TabsContent>

          <TabsContent value="community" className="space-y-8">
            <ContributionEngagementPanel />
          </TabsContent>
        </Tabs>

        {/* Creation Wizard Dialog */}
        <Dialog open={isCreateWizardOpen} onOpenChange={setIsCreateWizardOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Your Contribution</DialogTitle>
            </DialogHeader>
            <ContributionCreationWizard 
              onContributionCreated={handleContributionCreated}
            />
          </DialogContent>
        </Dialog>

        {/* Suggest Pathway Dialog */}
        <Dialog open={isSuggestPathwayOpen} onOpenChange={setIsSuggestPathwayOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Suggest New Pathway</DialogTitle>
            </DialogHeader>
            <div className="p-6 text-center">
              <p className="text-gray-600 mb-4">
                Have an idea for a new contribution pathway? We'd love to hear from you!
              </p>
              <div className="bg-dna-emerald/10 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  Pathway suggestion feature will be available in the full platform release.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ContributePageLayout>
  );
};

export default ContributionPlatform;
