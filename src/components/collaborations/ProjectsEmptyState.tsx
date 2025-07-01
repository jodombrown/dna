
import React from 'react';
import { Target, Zap, Lightbulb } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

interface ProjectsEmptyStateProps {
  hasFilters?: boolean;
  onStartProject?: () => void;
}

const ProjectsEmptyState: React.FC<ProjectsEmptyStateProps> = ({ 
  hasFilters = false,
  onStartProject 
}) => {
  if (hasFilters) {
    return (
      <EmptyState
        icon={Target}
        title="No initiatives match your criteria"
        description="Try adjusting your filters to discover more collaboration opportunities, or consider starting your own initiative to drive change."
        actionLabel="Start New Initiative"
        onAction={onStartProject}
        size="lg"
      />
    );
  }

  return (
    <EmptyState
      icon={Lightbulb}
      title="Be the first to create an initiative"
      description="Transform your ideas into impactful projects. Start a collaboration that brings together the diaspora community to solve challenges and create opportunities."
      actionLabel="Start New Initiative"
      onAction={onStartProject}
      size="lg"
    />
  );
};

export default ProjectsEmptyState;
