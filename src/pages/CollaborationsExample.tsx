
import React from 'react';
import { useCollaborationsLogic } from '@/hooks/useCollaborationsLogic';
import CollaborationsPageHeader from '@/components/collaborations/CollaborationsPageHeader';
import CollaborationsPrototypeNotice from '@/components/collaborations/CollaborationsPrototypeNotice';
import CollaborationsQuickStats from '@/components/collaborations/CollaborationsQuickStats';
import ProjectCard from '@/components/collaborations/ProjectCard';
import CollaborationsCallToAction from '@/components/collaborations/CollaborationsCallToAction';
import CollaborationsDialogs from '@/components/collaborations/CollaborationsDialogs';
import FeedbackPanel from '@/components/FeedbackPanel';
import Footer from '@/components/Footer';

const CollaborationsExample = () => {
  const {
    activeProjects,
    stats,
    isFeedbackPanelOpen,
    setIsFeedbackPanelOpen,
    isDiscussionDialogOpen,
    setIsDiscussionDialogOpen,
    isDocumentsDialogOpen,
    setIsDocumentsDialogOpen,
    isMeetingDialogOpen,
    setIsMeetingDialogOpen
  } = useCollaborationsLogic();

  const [isStartProjectDialogOpen, setIsStartProjectDialogOpen] = React.useState(false);
  const [isJoinProjectDialogOpen, setIsJoinProjectDialogOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <CollaborationsPageHeader activeProjectsCount={activeProjects.length} />
      <CollaborationsPrototypeNotice />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <CollaborationsQuickStats stats={stats} />

        <div className="space-y-6">
          {activeProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDiscussionClick={() => setIsDiscussionDialogOpen(true)}
              onDocumentsClick={() => setIsDocumentsDialogOpen(true)}
              onMeetingClick={() => setIsMeetingDialogOpen(true)}
            />
          ))}
        </div>

        <CollaborationsCallToAction onFeedbackClick={() => setIsFeedbackPanelOpen(true)} />
      </main>

      <Footer />

      <CollaborationsDialogs
        isStartProjectDialogOpen={isStartProjectDialogOpen}
        setIsStartProjectDialogOpen={setIsStartProjectDialogOpen}
        isJoinProjectDialogOpen={isJoinProjectDialogOpen}
        setIsJoinProjectDialogOpen={setIsJoinProjectDialogOpen}
        isDiscussionDialogOpen={isDiscussionDialogOpen}
        setIsDiscussionDialogOpen={setIsDiscussionDialogOpen}
        isDocumentsDialogOpen={isDocumentsDialogOpen}
        setIsDocumentsDialogOpen={setIsDocumentsDialogOpen}
        isMeetingDialogOpen={isMeetingDialogOpen}
        setIsMeetingDialogOpen={setIsMeetingDialogOpen}
      />
      
      <FeedbackPanel 
        isOpen={isFeedbackPanelOpen}
        onClose={() => setIsFeedbackPanelOpen(false)}
        pageType="collaborate"
      />
    </div>
  );
};

export default CollaborationsExample;
