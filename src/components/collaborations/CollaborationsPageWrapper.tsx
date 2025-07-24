
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobilePageNavigation from '@/components/ui/mobile-page-navigation';
import CollaborationsPrototypeNotice from './CollaborationsPrototypeNotice';
import CollaborationsPageHeaderSection from './CollaborationsPageHeaderSection';
import CollaborationsStatsSection from './CollaborationsStatsSection';
import CollaborationsMainContent from './CollaborationsMainContent';
import FeedbackPanel from '@/components/FeedbackPanel';
import PageSpecificSurvey from '@/components/survey/PageSpecificSurvey';
import { useEnhancedCollaborations } from '@/hooks/useEnhancedCollaborations';
import { useToast } from '@/hooks/use-toast';
import { CollaborationProject } from '@/types/collaborationTypes';

const CollaborationsPageWrapper = () => {
  const {
    projects,
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    sortBy,
    setSortBy,
    loading,
    stats
  } = useEnhancedCollaborations();

  const { toast } = useToast();
  const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = useState(false);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<CollaborationProject | null>(null);
  const [likedProjects, setLikedProjects] = useState<Set<string>>(new Set());
  const [bookmarkedProjects, setBookmarkedProjects] = useState<Set<string>>(new Set());

  const handleJoinProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    toast({
      title: "Interest Registered! 🎉",
      description: `Your expertise could be exactly what "${project?.title}" needs. The team will reach out within 24 hours to discuss how you can contribute.`,
      duration: 5000,
    });
  };

  const handleLikeProject = (projectId: string) => {
    const newLiked = new Set(likedProjects);
    const project = projects.find(p => p.id === projectId);
    
    if (likedProjects.has(projectId)) {
      newLiked.delete(projectId);
      toast({
        title: "Removed from liked",
        description: `"${project?.title}" removed from your liked initiatives.`,
      });
    } else {
      newLiked.add(projectId);
      toast({
        title: "Added to liked! ❤️",
        description: `"${project?.title}" added to your liked initiatives. We'll keep you updated on progress.`,
      });
    }
    setLikedProjects(newLiked);
  };

  const handleBookmarkProject = (projectId: string) => {
    const newBookmarked = new Set(bookmarkedProjects);
    const project = projects.find(p => p.id === projectId);
    
    if (bookmarkedProjects.has(projectId)) {
      newBookmarked.delete(projectId);
      toast({
        title: "Bookmark removed",
        description: `"${project?.title}" removed from saved initiatives.`,
      });
    } else {
      newBookmarked.add(projectId);
      toast({
        title: "Initiative bookmarked! 🔖",
        description: `"${project?.title}" saved for later. Access it anytime from your profile.`,
      });
    }
    setBookmarkedProjects(newBookmarked);
  };

  const handleContactTeam = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    toast({
      title: "Team Contact Request Sent! 📧",
      description: `We've notified the "${project?.title}" team about your interest. They'll reach out within 48 hours to discuss collaboration opportunities and next steps.`,
      duration: 6000,
    });
  };

  const handleViewDetails = (project: CollaborationProject) => {
    setSelectedProject(project);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <CollaborationsPrototypeNotice />
      
      <CollaborationsPageHeaderSection />
      
      <CollaborationsStatsSection stats={stats} />

      <CollaborationsMainContent
        projects={projects}
        filters={filters}
        updateFilters={updateFilters}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        likedProjects={likedProjects}
        bookmarkedProjects={bookmarkedProjects}
        onJoinProject={handleJoinProject}
        onLikeProject={handleLikeProject}
        onBookmarkProject={handleBookmarkProject}
        onContactTeam={handleContactTeam}
        onViewDetails={handleViewDetails}
        onOpenFeedbackPanel={() => setIsFeedbackPanelOpen(true)}
      />

      {/* Page-specific Survey CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-8">
        <div className="bg-gradient-to-r from-dna-emerald/10 via-dna-copper/10 to-dna-gold/10 rounded-xl p-8 text-center border border-dna-emerald/20">
          <h3 className="text-2xl font-bold text-dna-forest mb-4">
            Shape Our Collaboration Platform
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Help us build the perfect space for diaspora collaboration. Share your ideas on 
            project discovery, team formation, and the tools you need to create lasting impact.
          </p>
          <button
            onClick={() => setIsSurveyOpen(true)}
            className="bg-dna-emerald hover:bg-dna-forest text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Share Your Collaboration Ideas
          </button>
        </div>
      </div>

      <MobilePageNavigation currentPage="collaborate" />
      <Footer />
      
      <FeedbackPanel 
        isOpen={isFeedbackPanelOpen}
        onClose={() => setIsFeedbackPanelOpen(false)}
        pageType="collaborate"
      />
      
      <PageSpecificSurvey
        isOpen={isSurveyOpen}
        onClose={() => setIsSurveyOpen(false)}
        pageType="collaborate"
      />
    </div>
  );
};

export default CollaborationsPageWrapper;
