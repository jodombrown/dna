import React from 'react';
import { EnhancedPostComposer } from './EnhancedPostComposer';

interface FloatingPostComposerProps {
  defaultPillar?: string;
  onPostCreated?: () => void;
}

export const FloatingPostComposer: React.FC<FloatingPostComposerProps> = ({
  defaultPillar,
  onPostCreated
}) => {
  return (
    <EnhancedPostComposer 
      defaultPillar={defaultPillar}
      onPostCreated={onPostCreated}
    />
  );
};