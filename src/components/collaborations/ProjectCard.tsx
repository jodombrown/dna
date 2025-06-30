
import React from 'react';
import { Card } from '@/components/ui/card';
import { CollaborationProject } from '@/types/collaborationTypes';
import ProjectCardHeader from './project-card/ProjectCardHeader';
import ProjectCardContent from './project-card/ProjectCardContent';
import ProjectCardStats from './project-card/ProjectCardStats';
import ProjectCardActions from './project-card/ProjectCardActions';
import ProjectCardBadges from './project-card/ProjectCardBadges';
import ProjectCardQuickActions from './project-card/ProjectCardQuickActions';

interface ProjectCardProps {
  project: CollaborationProject;
  likedProjects: Set<string>;
  bookmarkedProjects: Set<string>;
  onJoinProject: (projectId: string) => void;
  onLikeProject?: (projectId: string) => void;
  onBookmarkProject?: (projectId: string) => void;
  onShareProject?: (projectId: string) => void;
  onViewDetails: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  likedProjects,
  bookmarkedProjects,
  onJoinProject,
  onLikeProject,
  onBookmarkProject,
  onShareProject,
  onViewDetails
}) => {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-l-4 border-l-dna-copper group">
      <div className="relative">
        {project.image_url && (
          <div className="h-48 overflow-hidden">
            <img 
              src={project.image_url} 
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        
        <ProjectCardBadges status={project.status} urgency={project.urgency} />
        <ProjectCardQuickActions
          projectId={project.id}
          likedProjects={likedProjects}
          bookmarkedProjects={bookmarkedProjects}
          onLikeProject={onLikeProject}
          onBookmarkProject={onBookmarkProject}
          onShareProject={onShareProject}
        />
      </div>

      <ProjectCardHeader project={project} />
      <ProjectCardContent project={project} />
      <ProjectCardStats project={project} />
      <ProjectCardActions
        projectId={project.id}
        onJoinProject={onJoinProject}
        onViewDetails={onViewDetails}
      />
    </Card>
  );
};

export default ProjectCard;
