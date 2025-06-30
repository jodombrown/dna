
import React from 'react';
import { CollaborationProject } from '@/types/collaborationTypes';
import ProjectCard from './ProjectCard';
import ProjectsEmptyState from './ProjectsEmptyState';

interface EnhancedProjectDiscoveryProps {
  projects: CollaborationProject[];
  viewMode?: 'grid' | 'list';
  likedProjects?: Set<string>;
  bookmarkedProjects?: Set<string>;
  onJoinProject: (projectId: string) => void;
  onLikeProject?: (projectId: string) => void;
  onBookmarkProject?: (projectId: string) => void;
  onShareProject?: (projectId: string) => void;
  onViewDetails: (projectId: string) => void;
}

const EnhancedProjectDiscovery: React.FC<EnhancedProjectDiscoveryProps> = ({
  projects,
  viewMode = 'list',
  likedProjects = new Set(),
  bookmarkedProjects = new Set(),
  onJoinProject,
  onLikeProject,
  onBookmarkProject,
  onShareProject,
  onViewDetails
}) => {
  if (projects.length === 0) {
    return <ProjectsEmptyState />;
  }

  return (
    <div className={`gap-6 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'space-y-6'}`}>
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          likedProjects={likedProjects}
          bookmarkedProjects={bookmarkedProjects}
          onJoinProject={onJoinProject}
          onLikeProject={onLikeProject}
          onBookmarkProject={onBookmarkProject}
          onShareProject={onShareProject}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

export default EnhancedProjectDiscovery;
