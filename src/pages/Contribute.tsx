import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import UnifiedHeader from '@/components/UnifiedHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, Plus, Building2, Heart, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import OpportunityList from '@/components/contribute/OpportunityList';
import OrganizationList from '@/components/contribute/OrganizationList';
import OpportunityFilters, { type FilterState } from '@/components/contribute/OpportunityFilters';
import CreateOrganizationDialog from '@/components/contribute/CreateOrganizationDialog';
import CreateOpportunityDialog from '@/components/contribute/CreateOpportunityDialog';

const Contribute = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [showCreateOpp, setShowCreateOpp] = useState(false);
  const [activeTab, setActiveTab] = useState('opportunities');
  const [filters, setFilters] = useState<FilterState>({
    type: [],
    skills: [],
    causes: [],
    sort: 'newest',
  });

  // Fetch available skills and causes for filters
  const { data: skills } = useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('skills').select('id, name');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: causes } = useQuery({
    queryKey: ['causes'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('causes').select('id, name');
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <UnifiedHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Contribute to Africa's Future
              </h1>
              <p className="text-muted-foreground text-lg">
                Discover opportunities to invest, volunteer, partner, or donate to impactful initiatives
              </p>
            </div>
            {user && (
              <div className="flex gap-2">
                <Button onClick={() => setShowCreateOrg(true)} variant="outline">
                  <Building2 className="mr-2 h-4 w-4" />
                  Create Organization
                </Button>
                <Button onClick={() => setShowCreateOpp(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Post Opportunity
                </Button>
              </div>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search opportunities, organizations, causes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>

            {/* Mobile Filter Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="lg" className="md:hidden">
                  <Filter className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <OpportunityFilters
                    filters={filters}
                    onChange={setFilters}
                    availableSkills={skills || []}
                    availableCauses={causes || []}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Content with Sidebar */}
        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <Card className="p-4 sticky top-4">
              <OpportunityFilters
                filters={filters}
                onChange={setFilters}
                availableSkills={skills || []}
                availableCauses={causes || []}
              />
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="opportunities" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Opportunities
                </TabsTrigger>
                <TabsTrigger value="organizations" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Organizations
                </TabsTrigger>
              </TabsList>

              <TabsContent value="opportunities" className="space-y-6">
                <OpportunityList searchQuery={searchQuery} filters={filters} />
              </TabsContent>

              <TabsContent value="organizations" className="space-y-6">
                <OrganizationList searchQuery={searchQuery} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <CreateOrganizationDialog open={showCreateOrg} onOpenChange={setShowCreateOrg} />
      <CreateOpportunityDialog open={showCreateOpp} onOpenChange={setShowCreateOpp} />
    </div>
  );
};

export default Contribute;
