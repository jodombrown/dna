
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ArrowUpDown, Users, Plus, Filter } from 'lucide-react';
import { CollaborationProject, CollaborationFilters } from '@/types/collaborationTypes';
import { useIsMobile } from '@/hooks/use-mobile';
import CollaborationFiltersComponent from './CollaborationFilters';
import CompactProjectCard from './CompactProjectCard';
import ProjectDetailDialog from './ProjectDetailDialog';

interface CollaborationsMainContentProps {
  projects: CollaborationProject[];
  filters: CollaborationFilters;
  updateFilters: (filters: Partial<CollaborationFilters>) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  sortBy: 'relevance' | 'urgency' | 'progress' | 'recent';
  setSortBy: (sortBy: 'relevance' | 'urgency' | 'progress' | 'recent') => void;
  selectedProject: CollaborationProject | null;
  setSelectedProject: (project: CollaborationProject | null) => void;
  likedProjects: Set<string>;
  bookmarkedProjects: Set<string>;
  onJoinProject: (projectId: string) => void;
  onLikeProject: (projectId: string) => void;
  onBookmarkProject: (projectId: string) => void;
  onViewDetails: (project: CollaborationProject) => void;
  onOpenFeedbackPanel: () => void;
}

const CollaborationsMainContent: React.FC<CollaborationsMainContentProps> = ({
  projects,
  filters,
  updateFilters,
  clearFilters,
  hasActiveFilters,
  sortBy,
  setSortBy,
  selectedProject,
  setSelectedProject,
  likedProjects,
  bookmarkedProjects,
  onJoinProject,
  onLikeProject,
  onBookmarkProject,
  onViewDetails,
  onOpenFeedbackPanel
}) => {
  const viewMode = 'list';
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const isMobile = useIsMobile();

  const FiltersSidebar = () => (
    <CollaborationFiltersComponent
      filters={filters}
      onFiltersChange={updateFilters}
      onClearFilters={clearFilters}
      hasActiveFilters={hasActiveFilters}
      resultCount={projects.length}
    />
  );

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <div className={`flex gap-6 ${isMobile ? 'flex-col' : ''} min-h-[calc(100vh-400px)]`}>
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className="w-80 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
            <FiltersSidebar />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
          {/* Controls Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                {/* Mobile Filter Button */}
                {isMobile && (
                  <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden">
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                        {hasActiveFilters && (
                          <Badge variant="secondary" className="ml-2 bg-dna-copper text-white text-xs px-1.5 py-0.5">
                            {Object.values(filters).flat().filter(Boolean).length}
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 p-0">
                      <FiltersSidebar />
                    </SheetContent>
                  </Sheet>
                )}

                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-gray-500" />
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-40 sm:w-48">
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

                {hasActiveFilters && !isMobile && (
                  <Badge variant="secondary" className="bg-dna-mint text-dna-forest">
                    ✨ {projects.length} filtered results
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  className="bg-dna-emerald hover:bg-dna-copper text-white flex-1 sm:flex-none"
                  onClick={onOpenFeedbackPanel}
                >
                  <Plus className="w-4 h-4" />
                  <span className="ml-2">New Initiative</span>
                </Button>
              </div>
            </div>

            {/* Mobile Results Count */}
            {isMobile && hasActiveFilters && (
              <div className="mt-3">
                <Badge variant="secondary" className="bg-dna-mint text-dna-forest">
                  ✨ {projects.length} results found
                </Badge>
              </div>
            )}
          </div>

          {/* Projects Grid/List */}
          <ScrollArea className="flex-1">
            <div className="p-4 sm:p-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                  {projects.map((project) => (
                    <CompactProjectCard
                      key={project.id}
                      project={project}
                      viewMode={isMobile ? 'list' : viewMode}
                      likedProjects={likedProjects}
                      bookmarkedProjects={bookmarkedProjects}
                      onJoinProject={onJoinProject}
                      onLikeProject={onLikeProject}
                      onBookmarkProject={onBookmarkProject}
                      onViewDetails={() => onViewDetails(project)}
                    />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      <ProjectDetailDialog
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        onJoinProject={onJoinProject}
        onLikeProject={onLikeProject}
        onBookmarkProject={onBookmarkProject}
        likedProjects={likedProjects}
        bookmarkedProjects={bookmarkedProjects}
      />
    </div>
  );
};

export default CollaborationsMainContent;
