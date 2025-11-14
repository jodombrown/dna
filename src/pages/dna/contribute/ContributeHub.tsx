import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import UnifiedHeader from '@/components/UnifiedHeader';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, DollarSign, Users, Clock, Key, Package } from 'lucide-react';
import type { ContributionNeedWithSpace } from '@/types/contributeTypes';

const typeIcons = {
  funding: DollarSign,
  skills: Users,
  time: Clock,
  access: Key,
  resources: Package,
};

const ContributeHub = () => {
  const { data: featuredNeeds, isLoading } = useQuery({
    queryKey: ['featured-needs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contribution_needs')
        .select(`
          *,
          space:spaces(id, name, slug, tagline, focus_areas, region)
        `)
        .in('status', ['open', 'in_progress'])
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as ContributionNeedWithSpace[];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Contribute to Africa's Future
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Fund, mentor, volunteer, and open doors for projects building across the continent and diaspora
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild size="lg">
              <Link to="/dna/contribute/needs">
                Browse All Needs <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Featured Needs */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Active Needs</h2>
              <p className="text-muted-foreground">
                Projects and initiatives currently seeking support
              </p>
            </div>
          </div>

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
          ) : featuredNeeds && featuredNeeds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredNeeds.map((need) => {
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
                              <Badge variant="destructive">High Priority</Badge>
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
                        {need.type === 'funding' && need.target_amount && (
                          <p className="text-sm font-semibold text-primary">
                            Target: {need.currency || '$'}{need.target_amount.toLocaleString()}
                          </p>
                        )}
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
                <h3 className="text-lg font-semibold mb-2">No active needs yet</h3>
                <p className="text-muted-foreground mb-4">
                  Check back soon for ways to contribute to projects
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* How to Contribute Section */}
        <section className="bg-muted/50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Ways to Contribute
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Funding</h3>
              <p className="text-sm text-muted-foreground">Invest in projects and initiatives</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Skills</h3>
              <p className="text-sm text-muted-foreground">Share your expertise</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Time</h3>
              <p className="text-sm text-muted-foreground">Volunteer your time</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Key className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Access</h3>
              <p className="text-sm text-muted-foreground">Open doors and make introductions</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Resources</h3>
              <p className="text-sm text-muted-foreground">Provide tools and materials</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContributeHub;
