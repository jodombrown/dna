import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useProjects } from '@/hooks/useProjects';
import ProjectCard from '@/components/projects/ProjectCard';
import ContributionModal from '@/components/projects/ContributionModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { Project, ContributionModalData, ContributionAction } from '@/types/projectTypes';

const ProjectsExplorePage = () => {
  const { projects, loading } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [contributionData, setContributionData] = useState<ContributionModalData | null>(null);

  const impactAreas = ['education', 'healthcare', 'technology', 'agriculture', 'climate', 'finance'];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || project.impact_area === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleContribute = (project: Project, action: ContributionAction) => {
    setContributionData({ project, action });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Explore Projects</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover meaningful projects across Africa and contribute your skills, time, or resources
            to make a lasting impact.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>

          {/* Filter Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedFilter('all')}
            >
              All Projects
            </Badge>
            {impactAreas.map(area => (
              <Badge
                key={area}
                variant={selectedFilter === area ? 'default' : 'outline'}
                className="cursor-pointer capitalize"
                onClick={() => setSelectedFilter(area)}
              >
                {area}
              </Badge>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-card rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-4 w-20"></div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-8 bg-muted rounded"></div>
                  <div className="h-8 bg-muted rounded"></div>
                  <div className="h-8 bg-muted rounded"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Be the first to create a project in this area!'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onContribute={handleContribute}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
      
      <ContributionModal
        data={contributionData}
        onClose={() => setContributionData(null)}
      />
    </div>
  );
};

export default ProjectsExplorePage;