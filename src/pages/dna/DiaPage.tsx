import React, { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Search, History, Lightbulb } from 'lucide-react';
import DiaSearch from '@/components/dia/DiaSearch';
import DiaHistory from '@/components/dia/DiaHistory';
import DiaInsights from '@/components/dia/DiaInsights';

export default function DiaPage() {
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
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">DIA</h1>
        <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base px-2">
          Your AI assistant for Africa and its global diaspora. Get intelligence about markets, opportunities, and connect with your network.
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
          <DiaSearch
            source="dia-page"
            initialQuery={selectedQuery}
          />
        </TabsContent>

        <TabsContent value="insights">
          <DiaInsights onInsightClick={handleInsightClick} />
        </TabsContent>

        <TabsContent value="history">
          <DiaHistory onQueryClick={handleHistoryClick} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
