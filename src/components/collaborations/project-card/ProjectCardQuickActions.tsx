
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Bookmark, Share2 } from 'lucide-react';

interface ProjectCardQuickActionsProps {
  projectId: string;
  likedProjects: Set<string>;
  bookmarkedProjects: Set<string>;
  onLikeProject?: (projectId: string) => void;
  onBookmarkProject?: (projectId: string) => void;
  onShareProject?: (projectId: string) => void;
}

const ProjectCardQuickActions: React.FC<ProjectCardQuickActionsProps> = ({
  projectId,
  likedProjects,
  bookmarkedProjects,
  onLikeProject,
  onBookmarkProject,
  onShareProject
}) => {
  return (
    <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      {onLikeProject && (
        <Button
          size="sm"
          variant="secondary"
          className="bg-white/90 backdrop-blur-sm"
          onClick={() => onLikeProject(projectId)}
        >
          <Heart className={`w-4 h-4 ${likedProjects.has(projectId) ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>
      )}
      {onBookmarkProject && (
        <Button
          size="sm"
          variant="secondary"
          className="bg-white/90 backdrop-blur-sm"
          onClick={() => onBookmarkProject(projectId)}
        >
          <Bookmark className={`w-4 h-4 ${bookmarkedProjects.has(projectId) ? 'fill-blue-500 text-blue-500' : ''}`} />
        </Button>
      )}
      {onShareProject && (
        <Button
          size="sm"
          variant="secondary"
          className="bg-white/90 backdrop-blur-sm"
          onClick={() => onShareProject(projectId)}
        >
          <Share2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default ProjectCardQuickActions;
