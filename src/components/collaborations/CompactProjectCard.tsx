
import React from 'react';
import { CollaborationProject } from '@/types/collaborationTypes';
import { useIsMobile } from '@/hooks/use-mobile';
import ProjectCardGridView from './project-card/ProjectCardGridView';
import ProjectCardListView from './project-card/ProjectCardListView';

interface CompactProjectCardProps {
  project: CollaborationProject;
  viewMode: 'grid' | 'list';
  likedProjects: Set<string>;
  bookmarkedProjects: Set<string>;
  onJoinProject: (projectId: string) => void;
  onLikeProject: (projectId: string) => void;
  onBookmarkProject: (projectId: string) => void;
  onViewDetails: () => void;
}

const CompactProjectCard: React.FC<CompactProjectCardProps> = ({
  project,
  viewMode,
  likedProjects,
  bookmarkedProjects,
  onJoinProject,
  onLikeProject,
  onBookmarkProject,
  onViewDetails
}) => {
  const isMobile = useIsMobile();
  
  // Force list view on mobile for better experience
  const effectiveViewMode = isMobile ? 'list' : viewMode;

  const commonProps = {
    project,
    likedProjects,
    bookmarkedProjects,
    onJoinProject,
    onLikeProject,
    onBookmarkProject,
    onViewDetails
  };

  if (effectiveViewMode === 'list') {
    return <ProjectCardListView {...commonProps} />;
  }

  return <ProjectCardGridView {...commonProps} />;
};

export default CompactProjectCard;
