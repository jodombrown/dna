
import React, { useState } from 'react';
import Header from '@/components/Header';
import { useEnhancedCollaborations } from '@/hooks/useEnhancedCollaborations';
import CollaborationsPrototypeNotice from '@/components/collaborations/CollaborationsPrototypeNotice';
import CollaborationsQuickStats from '@/components/collaborations/CollaborationsQuickStats';
import CollaborationFiltersComponent from '@/components/collaborations/CollaborationFilters';
import CompactProjectCard from '@/components/collaborations/CompactProjectCard';
import ProjectDetailDialog from '@/components/collaborations/ProjectDetailDialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import FeedbackPanel from '@/components/FeedbackPanel';
import Footer from '@/components/Footer';
import { ArrowUpDown, Grid, List, Users, Zap, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CollaborationProject } from '@/types/collaborationTypes';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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

  const handleViewDetails = (project: CollaborationProject) => {
    setSelectedProject(project);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <CollaborationsPrototypeNotice />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="w-8 h-8 text-dna-copper" />
              <Zap className="w-6 h-6 text-dna-gold" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Discover Impact Initiatives
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <CollaborationsQuickStats stats={stats} />
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex gap-6 h-[calc(100vh-400px)]">
          {/* Sidebar */}
          <div className="w-80 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
            <CollaborationFiltersComponent
              filters={filters}
              onFiltersChange={updateFilters}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
              resultCount={projects.length}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
            {/* Controls Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                    <Badge variant="secondary" className="bg-dna-mint text-dna-forest">
                      ✨ {projects.length} filtered results
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-dna-copper hover:bg-dna-gold' : ''}
                  >
                    <Grid className="w-4 h-4" />
                    <span className="hidden sm:inline ml-2">Grid</span>
                  </Button>
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
                    size="sm"
                    className="bg-dna-emerald hover:bg-dna-copper text-white ml-2"
                    onClick={() => setIsFeedbackPanelOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline ml-2">New Initiative</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Projects Grid/List */}
            <ScrollArea className="flex-1">
              <div className="p-6">
                {projects.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No initiatives found</h3>
                    <p className="text-gray-500 mb-6">Try adjusting your filters or search terms.</p>
                    <Button 
                      onClick={clearFilters}
                      variant="outline"
                      className="border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                ) : (
                  <div className={
                    viewMode === 'grid' 
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                      : 'space-y-4'
                  }>
                    {projects.map((project) => (
                      <CompactProjectCard
                        key={project.id}
                        project={project}
                        viewMode={viewMode}
                        likedProjects={likedProjects}
                        bookmarkedProjects={bookmarkedProjects}
                        onJoinProject={handleJoinProject}
                        onLikeProject={handleLikeProject}
                        onBookmarkProject={handleBookmarkProject}
                        onViewDetails={() => handleViewDetails(project)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      <Footer />
      
      <FeedbackPanel 
        isOpen={isFeedbackPanelOpen}
        onClose={() => setIsFeedbackPanelOpen(false)}
        pageType="collaborate"
      />

      <ProjectDetailDialog
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        onJoinProject={handleJoinProject}
        onLikeProject={handleLikeProject}
        onBookmarkProject={handleBookmarkProject}
        likedProjects={likedProjects}
        bookmarkedProjects={bookmarkedProjects}
      />
    </div>
  );
};

export default CollaborationsExample;
