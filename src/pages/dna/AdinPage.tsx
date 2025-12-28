import React, { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Search, History, Lightbulb } from 'lucide-react';
import AdinSearch from '@/components/adin/AdinSearch';
import AdinHistory from '@/components/adin/AdinHistory';
import AdinInsights from '@/components/adin/AdinInsights';

export default function AdinPage() {
  const [selectedQuery, setSelectedQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('search');

  const handleInsightClick = (query: string) => {
    setSelectedQuery(query);
    setActiveTab('search');
  };

  const handleHistoryClick = (query: string) => {
    setSelectedQuery(query);
    setActiveTab('search');
  };

  return (
    <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-4 max-w-5xl pb-20 sm:pb-8">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-emerald-500/10 mb-3 sm:mb-4">
          <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">ADIN Intelligence</h1>
        <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base px-2">
          Your AI-powered gateway to African diaspora opportunities, markets, and connections.
        </p>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
          <TabsTrigger value="search" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2.5 min-h-[44px]">
            <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Search</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2.5 min-h-[44px]">
            <Lightbulb className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Insights</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2.5 min-h-[44px]">
            <History className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <AdinSearch
            source="adin-page"
            initialQuery={selectedQuery}
          />
        </TabsContent>

        <TabsContent value="insights">
          <AdinInsights onInsightClick={handleInsightClick} />
        </TabsContent>

        <TabsContent value="history">
          <AdinHistory onQueryClick={handleHistoryClick} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
