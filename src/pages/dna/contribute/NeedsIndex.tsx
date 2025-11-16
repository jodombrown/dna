import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { Link } from 'react-router-dom';
import LayoutController from '@/components/LayoutController';
import { LeftNav } from '@/components/layout/columns/LeftNav';
import { RightWidgets } from '@/components/layout/columns/RightWidgets';

import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Users, Clock, Key, Package, Filter } from 'lucide-react';
import type { ContributionNeedWithSpace, ContributionNeedType, ContributionNeedStatus } from '@/types/contributeTypes';

const typeIcons = {
  funding: DollarSign,
  skills: Users,
  time: Clock,
  access: Key,
  resources: Package,
};

const NeedsIndex = () => {
  const [typeFilter, setTypeFilter] = useState<ContributionNeedType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ContributionNeedStatus | 'active'>('active');
  const [sortBy, setSortBy] = useState<'recent' | 'priority'>('priority');

  const { data: needs, isLoading } = useQuery({
    queryKey: ['contribution-needs', typeFilter, statusFilter, sortBy],
    queryFn: async () => {
      let query = supabaseClient
        .from('contribution_needs')
        .select(`
          *,
          space:spaces(id, name, slug, tagline, focus_areas, region)
        `);

      // Type filter
      if (typeFilter !== 'all') {
        query = query.eq('type', typeFilter);
      }

      // Status filter
      if (statusFilter === 'active') {
        query = query.in('status', ['open', 'in_progress']);
      } else {
        query = query.eq('status', statusFilter);
      }

      // Sorting
      if (sortBy === 'priority') {
        query = query.order('priority', { ascending: false }).order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ContributionNeedWithSpace[];
    },
  });

  return (
    <div className="min-h-screen bg-background pt-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Browse Needs</h1>
          <p className="text-muted-foreground">
            Find ways to contribute to projects across Africa and the diaspora
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card border rounded-lg p-4 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="funding">Funding</SelectItem>
                  <SelectItem value="skills">Skills</SelectItem>
                  <SelectItem value="time">Time</SelectItem>
                  <SelectItem value="access">Access</SelectItem>
                  <SelectItem value="resources">Resources</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active (Open + In Progress)</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="fulfilled">Fulfilled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="recent">Most Recent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Needs Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : needs && needs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {needs.map((need) => {
              const Icon = typeIcons[need.type];
              return (
                <Link key={need.id} to={`/dna/contribute/needs/${need.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <div className="flex gap-2">
                          <Badge variant={need.status === 'open' ? 'default' : 'secondary'}>
                            {need.status}
                          </Badge>
                          {need.priority === 'high' && (
                            <Badge variant="destructive">High</Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="line-clamp-2">{need.title}</CardTitle>
                      <CardDescription>
                        {need.space?.name} • {need.space?.region || 'Global'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {need.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground capitalize">{need.type}</span>
                        {need.type === 'funding' && need.target_amount && (
                          <span className="font-semibold text-primary">
                            {need.currency || '$'}{need.target_amount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No needs found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters to see more results
              </p>
              <Button onClick={() => {
                setTypeFilter('all');
                setStatusFilter('active');
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default NeedsIndex;
