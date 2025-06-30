
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
import FeedbackPanel from '@/components/FeedbackPanel';
import Footer from '@/components/Footer';
import { ArrowUpDown, Grid, List } from 'lucide-react';
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

  const handleJoinProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    toast({
      title: "Interest Registered!",
      description: `We've noted your interest in "${project?.title}". The project team will be in touch soon.`,
    });
  };

  const handleViewDetails = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    toast({
      title: "Project Details",
      description: `Opening detailed view for "${project?.title}"`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CollaborationsPrototypeNotice />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Discover Impact Initiatives
          </h1>
          <p className="text-gray-600 text-lg">
            Join meaningful projects driving positive change across Africa. 
            Your skills, network, and passion can make a real difference.
          </p>
        </div>

        {/* Quick Stats */}
        <CollaborationsQuickStats stats={stats} />

        <div className="grid lg:grid-cols-4 gap-8 mt-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <CollaborationFiltersComponent
              filters={filters}
              onFiltersChange={updateFilters}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
              resultCount={projects.length}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-gray-500" />
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Most Relevant</SelectItem>
                      <SelectItem value="urgency">Most Urgent</SelectItem>
                      <SelectItem value="progress">Most Progress</SelectItem>
                      <SelectItem value="recent">Most Recent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {hasActiveFilters && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {projects.length} filtered results
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Projects List */}
            <EnhancedProjectDiscovery
              projects={projects}
              onJoinProject={handleJoinProject}
              onViewDetails={handleViewDetails}
            />

            {/* Call to Action */}
            {projects.length > 0 && (
              <div className="text-center py-12 bg-white rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Don't see a project that matches your vision?
                </h3>
                <p className="text-gray-600 mb-6">
                  Start your own initiative and invite other diaspora members to collaborate.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    className="bg-dna-copper hover:bg-dna-gold text-white"
                    onClick={() => setIsFeedbackPanelOpen(true)}
                  >
                    Start New Initiative
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setIsFeedbackPanelOpen(true)}
                  >
                    Share Feedback
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

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
