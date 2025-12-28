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
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
          <Sparkles className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">ADIN Intelligence</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Your AI-powered gateway to African diaspora opportunities, markets, and connections.
        </p>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
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
