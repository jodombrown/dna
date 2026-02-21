import React from 'react';
import UnifiedHeader from '@/components/UnifiedHeader';
import ContributePrototypeNotice from '@/components/contribute/ContributePrototypeNotice';
import ContributeOverviewStats from '@/components/contribute/ContributeOverviewStats';
import ImpactDashboard from '@/components/contribute/ImpactDashboard';
import ContributionBreakdown from '@/components/contribute/ContributionBreakdown';
import PathwaysToImpact from '@/components/contribute/PathwaysToImpact';

import ContributeDialogs from '@/components/contribute/ContributeDialogs';
import FeedbackPanel from '@/components/FeedbackPanel';
import PageSpecificSurvey from '@/components/survey/PageSpecificSurvey';
import Footer from '@/components/Footer';
import { useContributeLogic } from '@/hooks/useContributeLogic';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { PageSEO } from '@/components/seo/PageSEO';
// Mobile page navigation removed - handled by global system

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

  const [isSurveyOpen, setIsSurveyOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageSEO
        title="Contribute: Invest in Africa's Future with the Diaspora"
        description="Make lasting impact through skills volunteering, investment opportunities, and knowledge transfer. Join the diaspora marketplace driving Africa's development."
        keywords={[
          'invest in africa',
          'diaspora investment',
          'africa development fund',
          'skills volunteering africa',
          'diaspora remittances',
          'africa impact investment',
        ]}
        canonicalPath="/contribute"
      />
      <UnifiedHeader />

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
        
        {/* Page-specific Survey CTA */}
        <div className="mt-12 bg-gradient-to-r from-dna-emerald/10 via-dna-copper/10 to-dna-gold/10 rounded-xl p-8 text-center border border-dna-emerald/20">
          <h3 className="text-2xl font-bold text-dna-forest mb-4">
            Help Us Perfect Contribution Tools
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Share your thoughts on impact tracking, funding mechanisms, and volunteer opportunities. 
            Your insights will help us create the most effective platform for African development.
          </p>
          <button
            onClick={() => setIsSurveyOpen(true)}
            className="bg-dna-emerald hover:bg-dna-forest text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Share Your Contribution Experience
          </button>
        </div>
      </main>

      {/* Mobile navigation handled by global MobileNavigation component */}
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
      
      <PageSpecificSurvey
        isOpen={isSurveyOpen}
        onClose={() => setIsSurveyOpen(false)}
        pageType="contribute"
      />
    </div>
  );
};

export default ContributeExample;
