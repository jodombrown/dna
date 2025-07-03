
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Calendar, ArrowLeft, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useToast } from '@/hooks/use-toast';
import { CommunityWithMembership } from '@/types/community';
import { formatDistanceToNow } from 'date-fns';

const CommunityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [community, setCommunity] = useState<CommunityWithMembership | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCommunityDetails = async () => {
    if (!id) return;

    try {
      // Fetch community details
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .select('*')
        .eq('id', id)
        .single();

      if (communityError) throw communityError;

      // Check user membership if logged in
      let userMembership = null;
      if (user) {
        const { data: membershipData } = await supabase
          .from('community_memberships' as any)
          .select('*')
          .eq('community_id', id)
          .eq('user_id', user.id)
          .single();
        
        userMembership = membershipData;
      }

      setCommunity({
        ...communityData,
        user_membership: userMembership,
        is_member: !!userMembership,
        user_role: userMembership?.role as 'admin' | 'moderator' | 'member' | undefined
      });

      // Fetch community members with profile data
      const { data: membersData, error: membersError } = await supabase
        .from('community_memberships' as any)
        .select(`
          *,
          profiles!inner(
            id,
            full_name,
            avatar_url,
            professional_role
          )
        `)
        .eq('community_id', id)
        .order('joined_at', { ascending: false });

      if (membersError) {
        console.error('Error fetching members:', membersError);
        // Continue without member data
      } else {
        setMembers(membersData || []);
      }

    } catch (error) {
      console.error('Error fetching community details:', error);
      toast({
        title: "Error",
        description: "Failed to load community details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMembershipAction = async () => {
    if (!user || !community) return;

    try {
      if (community.is_member) {
        // Leave community
        const { error } = await supabase
          .from('community_memberships' as any)
          .delete()
          .eq('user_id', user.id)
          .eq('community_id', community.id);

        if (error) throw error;

        toast({
          title: "Left Community",
          description: "You've left the community",
        });
      } else {
        // Join community
        const { error } = await supabase
          .from('community_memberships' as any)
          .insert({
            user_id: user.id,
            community_id: community.id,
            role: 'member'
          });

        if (error) throw error;

        toast({
          title: "Joined!",
          description: "You've successfully joined the community",
        });
      }

      fetchCommunityDetails();
    } catch (error) {
      console.error('Error with membership action:', error);
      toast({
        title: "Error",
        description: "Failed to update membership",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCommunityDetails();
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-dna-emerald"></div>
            <p className="mt-4 text-gray-600">Loading community...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Community not found</h3>
              <p className="text-gray-600 mb-6">The community you're looking for doesn't exist.</p>
              <Button onClick={() => navigate('/communities')}>
                Browse Communities
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/communities')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Communities
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Community Header */}
            <Card>
              <CardContent className="p-0">
                {community.cover_image_url && (
                  <div className="w-full h-64 overflow-hidden rounded-t-lg">
                    <img
                      src={community.cover_image_url}
                      alt={community.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {community.name}
                      </h1>
                      {community.category && (
                        <Badge variant="outline" className="mb-4">
                          {community.category}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {community.user_role === 'admin' && (
                        <Badge className="bg-dna-gold text-white">
                          <Crown className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                      
                      {user && (
                        <Button
                          variant={community.is_member ? "outline" : "default"}
                          className={community.is_member ? "" : "bg-dna-emerald hover:bg-dna-forest text-white"}
                          onClick={handleMembershipAction}
                        >
                          {community.is_member ? "Leave Community" : "Join Community"}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{community.member_count} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Created {formatDistanceToNow(new Date(community.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>

                  {community.description && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                      <p className="text-gray-700">{community.description}</p>
                    </div>
                  )}

                  {community.purpose_goals && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-2">Purpose & Goals</h3>
                      <p className="text-gray-700">{community.purpose_goals}</p>
                    </div>
                  )}

                  {community.tags && community.tags.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {community.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Community Activity Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Community Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center py-8">
                  Community discussions and events will appear here.
                  <br />
                  <span className="text-sm">Coming soon in a future update!</span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Members ({members.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.slice(0, 10).map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.profiles?.avatar_url} />
                        <AvatarFallback className="bg-dna-mint text-dna-forest">
                          {member.profiles?.full_name?.charAt(0) || 'M'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {member.profiles?.full_name || 'Community Member'}
                        </p>
                        {member.profiles?.professional_role && (
                          <p className="text-xs text-gray-600 truncate">
                            {member.profiles.professional_role}
                          </p>
                        )}
                      </div>
                      {member.role === 'admin' && (
                        <Crown className="w-4 h-4 text-dna-gold" />
                      )}
                    </div>
                  ))}
                  
                  {members.length > 10 && (
                    <p className="text-sm text-gray-600 text-center pt-2">
                      +{members.length - 10} more members
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CommunityDetail;
