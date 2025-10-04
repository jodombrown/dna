import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import UnifiedHeader from '@/components/UnifiedHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Building2, Heart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OpportunityList from '@/components/contribute/OpportunityList';
import OrganizationList from '@/components/contribute/OrganizationList';
import CreateOrganizationDialog from '@/components/contribute/CreateOrganizationDialog';
import CreateOpportunityDialog from '@/components/contribute/CreateOpportunityDialog';

const Contribute = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [showCreateOpp, setShowCreateOpp] = useState(false);
  const [activeTab, setActiveTab] = useState('opportunities');

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

          {/* Search */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search opportunities, organizations, causes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>

        {/* Tabs */}
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
            <OpportunityList searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="organizations" className="space-y-6">
            <OrganizationList searchQuery={searchQuery} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <CreateOrganizationDialog open={showCreateOrg} onOpenChange={setShowCreateOrg} />
      <CreateOpportunityDialog open={showCreateOpp} onOpenChange={setShowCreateOpp} />
    </div>
  );
};

export default Contribute;
