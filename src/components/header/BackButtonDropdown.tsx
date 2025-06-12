
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BackButtonDropdownProps {
  currentPage: string;
}

const BackButtonDropdown: React.FC<BackButtonDropdownProps> = ({ currentPage }) => {
  const navigate = useNavigate();

  const navigationItems = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Connect', path: '/connect' },
    { name: 'Collaborate', path: '/collaborate' },
    { name: 'Contribute', path: '/contribute' },
    { name: 'Contact', path: '/contact' },
  ];

  const phases = [
    { name: 'Prototyping Phase', path: '/prototyping-phase', phase: 1 },
    { name: 'Build Phase', path: '/build-phase', phase: 2 },
    { name: 'MVP Phase', path: '/mvp-phase', phase: 3 },
    { name: 'Customer Discovery Phase', path: '/customer-discovery-phase', phase: 4 },
    { name: 'Go-to-Market Phase', path: '/go-to-market-phase', phase: 5 },
  ];

  // Filter out current page
  const filteredNavItems = navigationItems.filter(item => 
    item.path !== `/${currentPage.toLowerCase()}`
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 hover:bg-dna-mint group"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Home</span>
          <span className="sm:hidden">Back</span>
          <ChevronDown className="w-3 h-3 transition-transform group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white shadow-lg z-50" align="start">
        {filteredNavItems.map((item) => (
          <DropdownMenuItem 
            key={item.path}
            onClick={() => navigate(item.path)}
            className="cursor-pointer hover:bg-dna-mint"
          >
            {item.name}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Development Phases
        </div>
        
        {phases.map((phase) => (
          <DropdownMenuItem 
            key={phase.path}
            onClick={() => navigate(phase.path)}
            className="cursor-pointer hover:bg-dna-mint pl-4"
          >
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-dna-copper text-white rounded-full flex items-center justify-center text-xs font-bold">
                {phase.phase}
              </div>
              <span className="text-sm">{phase.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BackButtonDropdown;
