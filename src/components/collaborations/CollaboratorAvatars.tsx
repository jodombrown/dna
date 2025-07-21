import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useBreathingAnimation } from '@/hooks/useBreathingAnimation';

interface CollaboratorAvatarsProps {
  collaborators: {
    avatar?: string;
    color: string;
  }[];
  totalCollaborators: number;
  maxVisible?: number;
}

const CollaboratorAvatars: React.FC<CollaboratorAvatarsProps> = ({
  collaborators,
  totalCollaborators,
  maxVisible = 3
}) => {
  const { elementRef } = useBreathingAnimation();
  
  const visibleCollaborators = collaborators.slice(0, maxVisible);
  const remainingCount = totalCollaborators - maxVisible;
  
  return (
    <div className="flex items-center space-x-1" ref={elementRef}>
      {visibleCollaborators.map((collaborator, index) => (
        <div
          key={index}
          className="w-6 h-6 rounded-full border-2 border-white shadow-sm animate-breathing-pulse"
          style={{ backgroundColor: collaborator.color }}
        >
          {collaborator.avatar && (
            <Avatar className="w-full h-full">
              <AvatarImage src={collaborator.avatar} className="rounded-full" />
              <AvatarFallback style={{ backgroundColor: collaborator.color }} />
            </Avatar>
          )}
        </div>
      ))}
      {remainingCount > 0 && (
        <span className="text-xs text-gray-500 font-medium ml-1">
          +{remainingCount} more
        </span>
      )}
    </div>
  );
};

export default CollaboratorAvatars;