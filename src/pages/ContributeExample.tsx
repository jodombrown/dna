
import React from 'react';
import Header from '@/components/Header';
import ContributePrototypeNotice from '@/components/contribute/ContributePrototypeNotice';
import ContributeOverviewStats from '@/components/contribute/ContributeOverviewStats';
import ImpactDashboard from '@/components/contribute/ImpactDashboard';
import ContributionBreakdown from '@/components/contribute/ContributionBreakdown';
import PathwaysToImpact from '@/components/contribute/PathwaysToImpact';
import ContributeCallToAction from '@/components/contribute/ContributeCallToAction';
import ContributeDialogs from '@/components/contribute/ContributeDialogs';
import FeedbackPanel from '@/components/FeedbackPanel';
import Footer from '@/components/Footer';
import { useContributeLogic } from '@/hooks/useContributeLogic';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import MobilePageNavigation from '@/components/ui/mobile-page-navigation';

const ContributeExample = () => {
  useScrollToTop();
  
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <ContributePrototypeNotice />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contribute to Africa</h1>
          <p className="text-gray-600">Make a lasting impact through purposeful contributions</p>
        </div>

        <ContributeOverviewStats />
        <ImpactDashboard myContributions={myContributions} />
        <ContributionBreakdown impactCategories={impactCategories} />

        <PathwaysToImpact
          pathways={contributionPathways}
          onContribute={() => setIsContributeDialogOpen(true)}
          onLearnMore={handleLearnMore}
        />

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
      
      <MobilePageNavigation currentPage="contribute" />
    </div>
  );
};

export default ContributeExample;
