import { useQuery } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { Link } from 'react-router-dom';
import UnifiedHeader from '@/components/UnifiedHeader';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HandHeart, ListChecks, Calendar } from 'lucide-react';
import { useState } from 'react';
import type { ContributionOfferWithDetails, ContributionNeedWithSpace } from '@/types/contributeTypes';

const MyContributions = () => {
  const [offerStatusFilter, setOfferStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'declined'>('all');

  const { data: myOffers, isLoading: offersLoading } = useQuery({
    queryKey: ['my-offers', offerStatusFilter],
    queryFn: async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return [];

      let query = supabaseClient
        .from('contribution_offers')
        .select(`
          *,
          need:contribution_needs(id, title, type),
          space:spaces(id, name, slug)
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (offerStatusFilter !== 'all') {
        query = query.eq('status', offerStatusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: myNeeds, isLoading: needsLoading } = useQuery({
    queryKey: ['my-needs'],
    queryFn: async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabaseClient
        .from('contribution_needs')
        .select(`
          *,
          space:spaces(id, name, slug),
          offers:contribution_offers(count)
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Contributions</h1>
          <p className="text-muted-foreground">
            Track your offers to help and needs you've posted
          </p>
        </div>

        <Tabs defaultValue="contributor" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="contributor">
              <HandHeart className="h-4 w-4 mr-2" />
              As Contributor
            </TabsTrigger>
            <TabsTrigger value="lead">
              <ListChecks className="h-4 w-4 mr-2" />
              As Lead
            </TabsTrigger>
          </TabsList>

          {/* As Contributor Tab */}
          <TabsContent value="contributor" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Offers I've Made</CardTitle>
                    <CardDescription>Your contributions to projects and initiatives</CardDescription>
                  </div>
                  <Select value={offerStatusFilter} onValueChange={(v) => setOfferStatusFilter(v as any)}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {offersLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading your offers...</p>
                  </div>
                ) : myOffers && myOffers.length > 0 ? (
                  <div className="space-y-4">
                    {myOffers.map((offer: any) => (
                      <Link key={offer.id} to={`/dna/contribute/needs/${offer.need_id}`}>
                        <Card className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <CardTitle className="text-base">{offer.need?.title}</CardTitle>
                                  <Badge variant={
                                    offer.status === 'accepted' ? 'default' :
                                    offer.status === 'completed' ? 'default' :
                                    offer.status === 'declined' ? 'destructive' :
                                    'secondary'
                                  }>
                                    {offer.status}
                                  </Badge>
                                </div>
                                <CardDescription>
                                  {offer.space?.name} • {offer.need?.type}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {offer.message}
                            </p>
                            {offer.offered_amount && (
                              <p className="text-sm font-semibold text-primary mb-2">
                                Offered: {offer.offered_currency || '$'}{offer.offered_amount.toLocaleString()}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              Submitted {new Date(offer.created_at).toLocaleDateString()}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <HandHeart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No offers yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start contributing by browsing active needs
                    </p>
                    <Button asChild>
                      <Link to="/dna/contribute/needs">Browse Needs</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* As Lead Tab */}
          <TabsContent value="lead" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Needs I've Posted</CardTitle>
                <CardDescription>Manage needs for your spaces</CardDescription>
              </CardHeader>
              <CardContent>
                {needsLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading your needs...</p>
                  </div>
                ) : myNeeds && myNeeds.length > 0 ? (
                  <div className="space-y-4">
                    {myNeeds.map((need: any) => (
                      <Link key={need.id} to={`/dna/contribute/needs/${need.id}`}>
                        <Card className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <CardTitle className="text-base">{need.title}</CardTitle>
                                  <Badge variant={need.status === 'open' ? 'default' : 'secondary'}>
                                    {need.status}
                                  </Badge>
                                  {need.priority === 'high' && (
                                    <Badge variant="destructive">High</Badge>
                                  )}
                                </div>
                                <CardDescription>
                                  {need.space?.name} • {need.type}
                                </CardDescription>
                              </div>
                              <Button variant="outline" size="sm">
                                Manage
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {need.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm">
                                <HandHeart className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  {need.offers?.[0]?.count || 0} {need.offers?.[0]?.count === 1 ? 'offer' : 'offers'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                Posted {new Date(need.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ListChecks className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No needs posted yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Post needs from your project spaces to get help from the community
                    </p>
                    <Button asChild>
                      <Link to="/dna/collaborate">Go to My Spaces</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default MyContributions;
