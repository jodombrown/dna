
import React from 'react';
import { Users, TrendingUp, Calendar } from 'lucide-react';
import { CollaborationProject } from '@/types/collaborationTypes';

interface ProjectCardStatsProps {
  project: CollaborationProject;
}

const ProjectCardStats: React.FC<ProjectCardStatsProps> = ({ project }) => {
  return (
    <div className="grid grid-cols-3 gap-4 py-3 border-t border-b border-gray-100">
      <div className="text-center">
        <div className="flex items-center justify-center mb-1">
          <Users className="w-4 h-4 text-dna-copper mr-1" />
          <span className="font-bold text-lg">{project.collaborators}</span>
        </div>
        <span className="text-xs text-gray-500">Contributors</span>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center mb-1">
          <TrendingUp className="w-4 h-4 text-dna-emerald mr-1" />
          <span className="font-bold text-lg">{project.progress}%</span>
        </div>
        <span className="text-xs text-gray-500">Complete</span>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center mb-1">
          <Calendar className="w-4 h-4 text-dna-gold mr-1" />
          <span className="font-bold text-sm">{project.timeline}</span>
        </div>
        <span className="text-xs text-gray-500">Timeline</span>
      </div>
    </div>
  );
};

export default ProjectCardStats;
