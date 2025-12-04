import { useQuery } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { Link } from 'react-router-dom';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, DollarSign, Users, Clock, Key, Package } from 'lucide-react';
import type { ContributionNeedWithSpace } from '@/types/contributeTypes';
import { TYPOGRAPHY } from '@/lib/typography.config';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const typeIcons = {
  funding: DollarSign,
  skills: Users,
  time: Clock,
  access: Key,
  resources: Package,
};

const ContributeHub = () => {
  useScrollToTop();

  const { data: featuredNeeds, isLoading } = useQuery({
    queryKey: ['featured-needs'],
    queryFn: async () => {
      const { data, error } = await supabaseClient
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
      <main className="container mx-auto px-4 py-4 pb-20 md:pb-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className={`${TYPOGRAPHY.h1} mb-4`}>
            Contribute to Africa's Future
          </h1>
          <p className={`${TYPOGRAPHY.bodyLarge} text-muted-foreground max-w-3xl mx-auto mb-8`}>
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
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className={`${TYPOGRAPHY.h2} mb-2`}>Active Needs</h2>
              <p className={TYPOGRAPHY.body}>
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
                          </div>
                        </div>
                        <CardTitle className="line-clamp-2">{need.title}</CardTitle>
                        <CardDescription className="line-clamp-1">
                          {need.space?.name || 'Project'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {need.description}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {need.region && (
                            <Badge variant="outline" className="text-xs">
                              {need.region}
                            </Badge>
                          )}
                          {need.priority && (
                            <Badge variant="outline" className="text-xs">
                              {need.priority} priority
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No active contribution needs at the moment. Check back soon!
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <DollarSign className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Fund Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Support initiatives with financial contributions that drive impact
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Share Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Offer your expertise to help projects succeed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Clock className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Volunteer Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Dedicate your time to make a real difference
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Key className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Open Doors</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Connect projects with opportunities and networks
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default ContributeHub;

