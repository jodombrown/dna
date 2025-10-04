import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import UnifiedHeader from '@/components/UnifiedHeader';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, ExternalLink, Edit, Building2, Heart, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EditOrganizationDialog from '@/components/contribute/EditOrganizationDialog';
import UploadLogoDialog from '@/components/contribute/UploadLogoDialog';

const OrganizationDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showEdit, setShowEdit] = useState(false);
  const [showUploadLogo, setShowUploadLogo] = useState(false);

  const { data: organization, isLoading } = useQuery({
    queryKey: ['organization', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Organization not found');
      return data;
    },
  });

  const { data: opportunities } = useQuery({
    queryKey: ['organization-opportunities', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      const { data, error } = await (supabase as any)
        .from('opportunities')
        .select('*')
        .eq('org_id', organization.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!organization?.id,
  });

  const isOwner = user?.id === organization?.owner_user_id;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <UnifiedHeader />
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          <Skeleton className="h-48 w-full mb-6" />
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <UnifiedHeader />
        <main className="container mx-auto px-4 py-8 max-w-5xl text-center">
          <Building2 className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-3xl font-bold mb-2">Organization Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The organization you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/contribute')}>
            Browse Organizations
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <UnifiedHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <div className="relative group">
                <Avatar className="h-24 w-24 cursor-pointer" onClick={() => isOwner && setShowUploadLogo(true)}>
                  <AvatarImage src={organization.logo_url || undefined} />
                  <AvatarFallback className="text-3xl">{organization.name[0]}</AvatarFallback>
                </Avatar>
                {isOwner && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center transition-opacity">
                    <Edit className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h1 className="text-3xl font-bold mb-1">{organization.name}</h1>
                    {organization.verified && (
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Verified Organization
                      </Badge>
                    )}
                  </div>
                  {isOwner && (
                    <Button onClick={() => setShowEdit(true)} variant="outline">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  {organization.website && (
                    <a
                      href={organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Website
                    </a>
                  )}
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {opportunities?.length || 0} Active Opportunities
                  </span>
                </div>

                <p className="text-muted-foreground">{organization.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Active Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!opportunities || opportunities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No active opportunities at the moment.
              </div>
            ) : (
              <div className="space-y-4">
                {opportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer"
                    onClick={() => navigate(`/contribute?opp=${opp.id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{opp.title}</h3>
                      <Badge>{opp.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {opp.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <EditOrganizationDialog
        organization={organization}
        open={showEdit}
        onOpenChange={setShowEdit}
      />
      <UploadLogoDialog
        organization={organization}
        open={showUploadLogo}
        onOpenChange={setShowUploadLogo}
      />
    </div>
  );
};

export default OrganizationDetail;
