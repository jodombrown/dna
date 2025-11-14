import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUpdateOfferStatus } from '@/hooks/useContributionMutations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateOfferStatus } from '@/hooks/useContributionMutations';
import { HandHeart } from 'lucide-react';
import type { ContributionOfferWithDetails, ContributionOfferStatus } from '@/types/contributeTypes';

interface NeedOffersSectionProps {
  needId: string;
  spaceId: string;
  isLead: boolean;
}

const NeedOffersSection = ({ needId, spaceId, isLead }: NeedOffersSectionProps) => {
  const [selectedOffer, setSelectedOffer] = useState<ContributionOfferWithDetails | null>(null);
  const updateStatusMutation = useUpdateOfferStatus();

  const { data: offers, isLoading } = useQuery({
    queryKey: ['need-offers', needId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contribution_offers')
        .select(`
          *,
          contributor:created_by(id, full_name, username, avatar_url)
        `)
        .eq('need_id', needId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: isLead,
  });

  const { data: offerCount } = useQuery({
    queryKey: ['need-offer-count', needId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('contribution_offers')
        .select('*', { count: 'exact', head: true })
        .eq('need_id', needId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !isLead,
  });

  const handleStatusChange = (offerId: string, newStatus: 'accepted' | 'declined' | 'completed') => {
    updateStatusMutation.mutate({ offerId, status: newStatus });
  };

  if (!isLead) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <HandHeart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            {offerCount ? `${offerCount} ${offerCount === 1 ? 'person has' : 'people have'} offered to help` : 'No offers yet'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Offers</CardTitle>
          <CardDescription>Loading offers...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Offers ({offers?.length || 0})</CardTitle>
          <CardDescription>
            People who have offered to help with this need
          </CardDescription>
        </CardHeader>
        <CardContent>
          {offers && offers.length > 0 ? (
            <div className="space-y-4">
              {offers.map((offer: any) => (
                <div key={offer.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={offer.contributor?.avatar_url} />
                        <AvatarFallback>
                          {offer.contributor?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{offer.contributor?.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          @{offer.contributor?.username}
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      offer.status === 'accepted' ? 'default' :
                      offer.status === 'completed' ? 'default' :
                      offer.status === 'declined' ? 'destructive' :
                      'secondary'
                    }>
                      {offer.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {offer.message}
                  </p>

                  {offer.offered_amount && (
                    <p className="text-sm font-semibold text-primary mb-3">
                      Offered: {offer.offered_currency || '$'}{offer.offered_amount.toLocaleString()}
                    </p>
                  )}

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOffer(offer)}
                    >
                      View Full Message
                    </Button>
                    
                    <Select
                      value={offer.status}
                      onValueChange={(value) => updateStatusMutation.mutate({
                        offerId: offer.id,
                        status: value as ContributionOfferStatus
                      })}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="accepted">Accept</SelectItem>
                        <SelectItem value="declined">Decline</SelectItem>
                        <SelectItem value="completed">Mark Complete</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <p className="text-xs text-muted-foreground mt-3">
                    Submitted {new Date(offer.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <HandHeart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No offers yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full message dialog */}
      {selectedOffer && (
        <Dialog open={!!selectedOffer} onOpenChange={() => setSelectedOffer(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Offer from {selectedOffer.contributor?.full_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Message:</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedOffer.message}
                </p>
              </div>
              {selectedOffer.offered_amount && (
                <div>
                  <p className="text-sm font-medium mb-2">Offered Amount:</p>
                  <p className="text-sm font-semibold text-primary">
                    {selectedOffer.offered_currency || '$'}{selectedOffer.offered_amount.toLocaleString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium mb-2">Status:</p>
                <Badge variant={
                  selectedOffer.status === 'accepted' ? 'default' :
                  selectedOffer.status === 'completed' ? 'default' :
                  selectedOffer.status === 'declined' ? 'destructive' :
                  'secondary'
                }>
                  {selectedOffer.status}
                </Badge>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default NeedOffersSection;
