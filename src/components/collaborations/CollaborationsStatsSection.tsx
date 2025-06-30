
import React from 'react';
import CollaborationsQuickStats from './CollaborationsQuickStats';
import { CollaborationStats } from '@/types/collaborationTypes';

interface CollaborationsStatsSectionProps {
  stats: CollaborationStats;
}

const CollaborationsStatsSection: React.FC<CollaborationsStatsSectionProps> = ({ stats }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <CollaborationsQuickStats stats={stats} />
    </div>
  );
};

export default CollaborationsStatsSection;
