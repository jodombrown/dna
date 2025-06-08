
import React from 'react';
import { Button } from '@/components/ui/button';

interface ConnectTabNavigationProps {
  activeTab: 'professionals' | 'communities' | 'events';
  onTabChange: (tab: 'professionals' | 'communities' | 'events') => void;
}

const ConnectTabNavigation: React.FC<ConnectTabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex gap-4 mb-6">
      <Button
        variant={activeTab === 'professionals' ? 'default' : 'outline'}
        onClick={() => onTabChange('professionals')}
        className={activeTab === 'professionals' ? 'bg-dna-emerald hover:bg-dna-forest text-white' : ''}
      >
        Professionals
      </Button>
      <Button
        variant={activeTab === 'communities' ? 'default' : 'outline'}
        onClick={() => onTabChange('communities')}
        className={activeTab === 'communities' ? 'bg-dna-emerald hover:bg-dna-forest text-white' : ''}
      >
        Communities
      </Button>
      <Button
        variant={activeTab === 'events' ? 'default' : 'outline'}
        onClick={() => onTabChange('events')}
        className={activeTab === 'events' ? 'bg-dna-emerald hover:bg-dna-forest text-white' : ''}
      >
        Events
      </Button>
    </div>
  );
};

export default ConnectTabNavigation;
