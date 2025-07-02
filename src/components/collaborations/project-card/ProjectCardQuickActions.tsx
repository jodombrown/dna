
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Bookmark, Share, X } from 'lucide-react';

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
    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        size="sm"
        variant="secondary"
        className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
        onClick={() => onLikeProject?.(projectId)}
      >
        <Heart className={`w-4 h-4 ${likedProjects.has(projectId) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
      </Button>
      <Button
        size="sm"
        variant="secondary"
        className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
        onClick={() => onBookmarkProject?.(projectId)}
      >
        <Bookmark className={`w-4 h-4 ${bookmarkedProjects.has(projectId) ? 'fill-blue-500 text-blue-500' : 'text-gray-600'}`} />
      </Button>
      <Button
        size="sm"
        variant="secondary"
        className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
        onClick={() => onShareProject?.(projectId)}
      >
        <Share className="w-4 h-4 text-gray-600" />
      </Button>
    </div>
  );
};

export default ProjectCardQuickActions;
