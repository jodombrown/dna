
import React, { useState } from 'react';
import Header from '@/components/Header';
import { useEnhancedCollaborations } from '@/hooks/useEnhancedCollaborations';
import CollaborationsPrototypeNotice from '@/components/collaborations/CollaborationsPrototypeNotice';
import CollaborationsQuickStats from '@/components/collaborations/CollaborationsQuickStats';
import EnhancedProjectDiscovery from '@/components/collaborations/EnhancedProjectDiscovery';
import CollaborationFiltersComponent from '@/components/collaborations/CollaborationFilters';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import FeedbackPanel from '@/components/FeedbackPanel';
import Footer from '@/components/Footer';
import { ArrowUpDown, Grid, List, Heart, Share2, Bookmark, Users, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CollaborationsExample = () => {
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
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

  const handleShareProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (navigator.share) {
      navigator.share({
        title: `Join "${project?.title}" - DNA Initiative`,
        text: `Check out this impactful African initiative: ${project?.description}`,
        url: window.location.href + `?project=${projectId}`,
      });
    } else {
      navigator.clipboard.writeText(window.location.href + `?project=${projectId}`);
      toast({
        title: "Link copied! 📋",
        description: `Share "${project?.title}" with your network to amplify its impact.`,
      });
    }
  };

  const handleViewDetails = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    toast({
      title: "Project Details",
      description: `Opening detailed view for "${project?.title}"`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col">
      <Header />
      <CollaborationsPrototypeNotice />

      {/* Enhanced Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Users className="w-8 h-8 text-dna-copper" />
          <Zap className="w-6 h-6 text-dna-gold" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Discover Impact Initiatives
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Join meaningful projects driving positive change across Africa. 
          Your unique skills, global network, and diaspora perspective can create lasting impact.
        </p>
        <div className="flex items-center justify-center gap-4 mt-6">
          <Badge className="bg-dna-emerald text-white px-4 py-2">
            🌍 Pan-African Focus
          </Badge>
          <Badge className="bg-dna-copper text-white px-4 py-2">
            🤝 Diaspora-Led
          </Badge>
          <Badge className="bg-dna-gold text-white px-4 py-2">
            📈 Impact-Driven
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CollaborationsQuickStats stats={stats} />
      </div>

      {/* Main Content with Fixed Heights */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-500px)]">
          {/* Sidebar - Fixed Width with Internal Scroll */}
          <div className="lg:col-span-1">
            <div className="h-full bg-white rounded-xl border border-gray-200 shadow-sm">
              <CollaborationFiltersComponent
                filters={filters}
                onFiltersChange={updateFilters}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
                resultCount={projects.length}
              />
            </div>
          </div>

          {/* Projects Area with Controls and Scrollable Content */}
          <div className="lg:col-span-3 flex flex-col h-full">
            {/* Controls Bar - Fixed at top */}
            <div className="mb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-gray-500" />
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">🎯 Most Relevant</SelectItem>
                        <SelectItem value="urgency">🚨 Most Urgent</SelectItem>
                        <SelectItem value="progress">📈 Most Progress</SelectItem>
                        <SelectItem value="recent">🆕 Most Recent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {hasActiveFilters && (
                    <Badge variant="secondary" className="flex items-center gap-1 bg-dna-mint text-dna-forest">
                      ✨ {projects.length} filtered results
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-dna-copper hover:bg-dna-gold' : ''}
                  >
                    <List className="w-4 h-4" />
                    <span className="hidden sm:inline ml-2">List</span>
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-dna-copper hover:bg-dna-gold' : ''}
                  >
                    <Grid className="w-4 h-4" />
                    <span className="hidden sm:inline ml-2">Grid</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Scrollable Projects Container */}
            <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <EnhancedProjectDiscovery
                    projects={projects}
                    viewMode={viewMode}
                    likedProjects={likedProjects}
                    bookmarkedProjects={bookmarkedProjects}
                    onJoinProject={handleJoinProject}
                    onLikeProject={handleLikeProject}
                    onBookmarkProject={handleBookmarkProject}
                    onShareProject={handleShareProject}
                    onViewDetails={handleViewDetails}
                  />

                  {/* Call to Action - Inside scroll area */}
                  {projects.length > 0 && (
                    <div className="bg-gradient-to-r from-dna-copper/10 via-dna-emerald/10 to-dna-gold/10 rounded-xl p-8 text-center border border-dna-copper/20 mt-8">
                      <div className="max-w-2xl mx-auto">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          Ready to Start Your Own Initiative?
                        </h3>
                        <p className="text-gray-600 mb-6 text-lg">
                          Don't see a project that matches your vision? The African diaspora is powerful when we unite our diverse skills and perspectives.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <Button 
                            size="lg"
                            className="bg-dna-copper hover:bg-dna-gold text-white shadow-lg hover:shadow-xl transition-all"
                            onClick={() => setIsFeedbackPanelOpen(true)}
                          >
                            <Zap className="w-5 h-5 mr-2" />
                            Launch New Initiative
                          </Button>
                          <Button 
                            size="lg"
                            variant="outline"
                            className="border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white"
                            onClick={() => setIsFeedbackPanelOpen(true)}
                          >
                            <Heart className="w-5 h-5 mr-2" />
                            Share Your Ideas
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      
      <FeedbackPanel 
        isOpen={isFeedbackPanelOpen}
        onClose={() => setIsFeedbackPanelOpen(false)}
        pageType="collaborate"
      />
    </div>
  );
};

export default CollaborationsExample;
