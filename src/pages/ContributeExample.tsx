
import React, { useEffect } from 'react';
import ContributePageHeader from '@/components/contribute/ContributePageHeader';
import ContributePrototypeNotice from '@/components/contribute/ContributePrototypeNotice';
import ContributeOverviewStats from '@/components/contribute/ContributeOverviewStats';
import ImpactDashboard from '@/components/contribute/ImpactDashboard';
import ContributionBreakdown from '@/components/contribute/ContributionBreakdown';
import ContributionPathwayCard from '@/components/contribute/ContributionPathwayCard';
import ContributionMethods from '@/components/contribute/ContributionMethods';
import ContributeCallToAction from '@/components/contribute/ContributeCallToAction';
import ContributeDialogs from '@/components/contribute/ContributeDialogs';
import FeedbackPanel from '@/components/FeedbackPanel';
import Footer from '@/components/Footer';
import { useContributeLogic } from '@/hooks/useContributeLogic';

const ContributeExample = () => {
  const {
    isFeedbackPanelOpen,
    setIsFeedbackPanelOpen,
    isContributeDialogOpen,
    setIsContributeDialogOpen,
    isLearnMoreOpen,
    setIsLearnMoreOpen,
    selectedPathway,
    contributionPathways,
    myContributions,
    impactCategories,
    handleLearnMore
  } = useContributeLogic();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <ContributePageHeader />
      <ContributePrototypeNotice />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <ContributeOverviewStats />
        <ImpactDashboard myContributions={myContributions} />
        <ContributionBreakdown impactCategories={impactCategories} />

        <div className="mb-8">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Active Contribution Pathways</h3>
          <div className="space-y-6">
            {contributionPathways.map((pathway) => (
              <ContributionPathwayCard
                key={pathway.id}
                pathway={pathway}
                onContribute={() => setIsContributeDialogOpen(true)}
                onLearnMore={handleLearnMore}
              />
            ))}
          </div>
        </div>

        <ContributionMethods />
        <ContributeCallToAction onFeedbackClick={() => setIsFeedbackPanelOpen(true)} />
      </main>

      <Footer />
      
      <ContributeDialogs
        isContributeDialogOpen={isContributeDialogOpen}
        setIsContributeDialogOpen={setIsContributeDialogOpen}
        isLearnMoreOpen={isLearnMoreOpen}
        setIsLearnMoreOpen={setIsLearnMoreOpen}
        selectedPathway={selectedPathway}
      />
      
      <FeedbackPanel 
        isOpen={isFeedbackPanelOpen}
        onClose={() => setIsFeedbackPanelOpen(false)}
        pageType="contribute"
      />
    </div>
  );
};

export default ContributeExample;
