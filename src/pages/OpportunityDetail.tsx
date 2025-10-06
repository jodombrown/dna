import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, MapPin, Clock, Bookmark, Share2, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { ApplicationForm } from '@/components/opportunities/ApplicationForm';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const { data: opportunity, isLoading } = useQuery({
    queryKey: ['opportunity', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          creator:created_by (
            id,
            full_name,
            username,
            avatar_url,
            verified
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: existingApplication } = useQuery({
    queryKey: ['application', id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('applications')
        .select('*')
        .eq('opportunity_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      return data;
    },
  });

  const handleBookmark = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Please sign in to bookmark opportunities" });
      return;
    }

    setIsBookmarked(!isBookmarked);
    toast({ title: isBookmarked ? "Bookmark removed" : "Opportunity bookmarked" });
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: opportunity?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Opportunity not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/dna/impact')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Opportunities
        </Button>

        {opportunity.image_url && (
          <div className="w-full h-64 rounded-lg overflow-hidden mb-6">
            <img
              src={opportunity.image_url}
              alt={opportunity.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{opportunity.title}</h1>
            <Badge variant="outline" className="mb-4">{opportunity.type}</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleBookmark}>
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current text-dna-copper' : ''}`} />
            </Button>
            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {opportunity.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{opportunity.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Posted {format(new Date(opportunity.created_at), 'MMM d, yyyy')}</span>
            </div>
          </CardContent>
        </Card>

        {opportunity.description && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{opportunity.description}</p>
            </CardContent>
          </Card>
        )}

        {opportunity.tags && opportunity.tags.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Skills & Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {opportunity.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {opportunity.creator && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Posted By</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={opportunity.creator.avatar_url} />
                  <AvatarFallback>{opportunity.creator.full_name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{opportunity.creator.full_name}</p>
                  <p className="text-sm text-muted-foreground">@{opportunity.creator.username}</p>
                </div>
                {opportunity.creator.verified && (
                  <CheckCircle2 className="h-4 w-4 text-dna-copper" />
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {existingApplication ? (
          <Card className="border-dna-copper">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-dna-copper mb-2">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-semibold">Application Submitted</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Status: <span className="capitalize">{existingApplication.status}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Applied on {format(new Date(existingApplication.applied_at), 'MMM d, yyyy')}
              </p>
            </CardContent>
          </Card>
        ) : showApplicationForm ? (
          <ApplicationForm
            opportunityId={id!}
            opportunityTitle={opportunity.title}
            onCancel={() => setShowApplicationForm(false)}
            onSuccess={() => {
              setShowApplicationForm(false);
              toast({ title: "Application submitted successfully!" });
            }}
          />
        ) : (
          <Button
            onClick={() => setShowApplicationForm(true)}
            size="lg"
            className="w-full"
          >
            Apply Now
          </Button>
        )}
      </div>
    </div>
  );
}
