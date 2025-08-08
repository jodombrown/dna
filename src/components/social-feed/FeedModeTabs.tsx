import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FeedModeTabsProps {
  mode: 'relevant' | 'trending' | 'spotlight';
  onChange: (mode: 'relevant' | 'trending' | 'spotlight') => void;
}

const FeedModeTabs: React.FC<FeedModeTabsProps> = ({ mode, onChange }) => {
  return (
    <nav aria-label="Feed mode" className="ml-auto">
      <Tabs value={mode} onValueChange={(v) => onChange(v as any)}>
        <TabsList>
          <TabsTrigger value="relevant">For You</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="spotlight">Spotlight</TabsTrigger>
        </TabsList>
      </Tabs>
    </nav>
  );
};

export default FeedModeTabs;
