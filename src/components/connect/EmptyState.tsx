
import React from 'react';
import { Users, Calendar, Building, RefreshCw } from 'lucide-react';
import { EmptyState as BaseEmptyState } from '@/components/ui/empty-state';

interface EmptyStateProps {
  type: 'professionals' | 'communities' | 'events';
  onRefresh: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, onRefresh }) => {
  const configs = {
    professionals: {
      icon: Users,
      title: "No professionals found",
      description: "We're constantly growing our network. Check back soon or help us expand by inviting professionals you know."
    },
    communities: {
      icon: Building,
      title: "No communities available", 
      description: "Communities are the heart of our network. Be a pioneer and help us build vibrant spaces for collaboration."
    },
    events: {
      icon: Calendar,
      title: "No events scheduled",
      description: "Events bring us together virtually and in-person. Create connections and share knowledge through meaningful gatherings."
    }
  };

  const config = configs[type];

  return (
    <BaseEmptyState
      icon={config.icon}
      title={config.title}
      description={config.description}
      actionLabel="Refresh Network"
      onAction={onRefresh}
      size="lg"
    />
  );
};

export default EmptyState;
