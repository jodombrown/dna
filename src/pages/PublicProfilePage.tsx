/**
 * Publicly Accessible Profile Page
 * Route: /dna/u/:username
 * 
 * This page is accessible to ANYONE - no authentication required.
 * Shows profile information and CTAs to sign up or connect.
 */

import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  MapPin, 
  Briefcase, 
  Globe2, 
  MessageCircle, 
  UserPlus,
  UserCheck,
  Clock,
  User,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProfileShareDropdown } from '@/components/profile/ProfileShareDropdown';
import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { messageService } from '@/services/messageService';

// About section component with read more functionality
const AboutSection = ({ bio }: { bio: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const charLimit = 200;
  const needsTruncation = bio.length > charLimit;
  
  const displayText = isExpanded || !needsTruncation 
    ? bio 
    : bio.slice(0, charLimit).trim() + '...';
  
  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-2">About</h3>
      <p className="text-muted-foreground whitespace-pre-wrap">{displayText}</p>
      {needsTruncation && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-primary text-sm font-medium mt-2 hover:underline"
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
};

const PublicProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch profile data using unified RPC - same source as owner profile and PDF
  // The RPC handles privacy checks server-side (returns NULL for non-public profiles when not owner)
  const { data: profileBundle, isLoading, error } = useQuery({
    queryKey: ['public-profile-view', username, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('rpc_get_profile_bundle', {
        p_username: username,
        p_viewer_id: user?.id || null,
      });

      if (error) throw error;
      if (!data) throw new Error('Profile not found or private');
      
      // Cast to expected structure
      const bundle = data as unknown as { 
        profile: any; 
        permissions?: { is_owner?: boolean };
        tags?: any;
        visibility?: any;
      };
      
      if (!bundle.profile) throw new Error('Profile not found or private');
      
      return bundle;
    },
    enabled: !!username,
  });

  // Extract profile from bundle for backward compatibility
  const profile = profileBundle?.profile;
  const tags = profileBundle?.tags;
  const visibility = profileBundle?.visibility;

  const isLoggedIn = !!user;
  const isOwnProfile = user?.id === profile?.id;
  // Check if profile allows sharing by others (default to true if not set)
  const allowSharing = profile?.allow_profile_sharing !== false;
  
  // Get connection status between current user and profile owner
  const { data: connectionStatus, isLoading: connectionLoading } = useConnectionStatus(profile?.id);
  
  // Helper to check visibility settings
  const shouldShowSection = (section: 'about' | 'skills' | 'interests' | 'activity'): boolean => {
    if (isOwnProfile) return true; // Owner sees everything
    if (!visibility) return true; // No settings = default public
    return visibility[section] !== 'hidden';
  };

  // Handle connect click - redirect to auth if not logged in
  const handleConnect = () => {
    if (!isLoggedIn) {
      // Store the intended action and redirect to auth
      sessionStorage.setItem('dna_connect_after_auth', profile?.id || '');
      navigate(`/auth?redirect=/dna/${username}`);
      return;
    }
    // If logged in, go to the authenticated profile page where they can connect
    navigate(`/dna/${username}`);
  };

  // Handle message click - now works directly for connected users
  const handleMessage = async () => {
    if (!isLoggedIn) {
      sessionStorage.setItem('dna_message_after_auth', profile?.id || '');
      navigate(`/auth?redirect=/dna/${username}`);
      return;
    }
    
    // If connected, start a conversation directly
    if (connectionStatus === 'accepted' && profile?.id) {
      try {
        const { id: conversationId } = await messageService.getOrCreateConversation(profile.id);
        navigate(`/dna/messages/${conversationId}`);
      } catch (error: any) {
        toast({
          title: 'Cannot start conversation',
          description: error.message || 'Please try again',
          variant: 'destructive',
        });
      }
      return;
    }
    
    // Otherwise redirect to profile page
    navigate(`/dna/${username}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-16 text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-3xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This profile doesn't exist, has been removed, or is set to private.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate('/')}>
              Visit DNA
            </Button>
            {!isLoggedIn && (
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Sign Up for DNA
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const displayName = profile.full_name || profile.username || 'DNA Member';
  const displayRole = profile.profession || profile.headline;

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{displayName} | DNA - Diaspora Network of Africa</title>
        <meta name="description" content={profile.bio || `Connect with ${displayName} on DNA - the global network for the African diaspora.`} />
        <meta property="og:title" content={`${displayName} | DNA`} />
        <meta property="og:description" content={profile.bio || `Connect with ${displayName} on DNA.`} />
        <meta property="og:image" content={profile.avatar_url || '/og-image.png'} />
        <meta property="og:url" content={`${window.location.origin}/u/${username}`} />
        <meta property="og:type" content="profile" />
        <meta name="twitter:card" content="summary" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          {/* Profile Card */}
          <Card>
            <CardContent className="pt-8">
              <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-background shrink-0">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl sm:text-3xl bg-dna-mint text-dna-forest">
                    {displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">{displayName}</h1>
                  
                  {displayRole && (
                    <div className="flex items-center text-muted-foreground mb-2">
                      <Briefcase className="w-4 h-4 mr-2 shrink-0" />
                      <span className="break-words">{displayRole}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                    {profile.current_country && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 shrink-0" />
                        <span className="break-words">{profile.current_country}</span>
                      </div>
                    )}
                    {profile.country_of_origin && profile.country_of_origin !== profile.current_country && (
                      <div className="flex items-center">
                        <Globe2 className="w-4 h-4 mr-1 shrink-0" />
                        <span className="break-words">From {profile.country_of_origin}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons - Only show for non-own profiles */}
              {!isOwnProfile && (
                <div className="flex flex-wrap gap-3 mb-6">
                  {/* Not logged in - show sign up CTA */}
                  {!isLoggedIn && (
                    <Button
                      onClick={handleConnect}
                      className="bg-dna-copper hover:bg-dna-gold"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Sign Up to Connect
                    </Button>
                  )}
                  
                  {/* Loading state for connection status */}
                  {isLoggedIn && connectionLoading && (
                    <Button variant="outline" disabled>
                      <Clock className="w-4 h-4 mr-2 animate-pulse" />
                      Checking...
                    </Button>
                  )}
                  
                  {/* Logged in - show status-based buttons (only when not loading) */}
                  {isLoggedIn && !connectionLoading && connectionStatus === 'none' && (
                    <Button
                      onClick={handleConnect}
                      className="bg-dna-copper hover:bg-dna-gold"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  )}
                  
                  {isLoggedIn && !connectionLoading && connectionStatus === 'pending_sent' && (
                    <Button variant="outline" disabled>
                      <Clock className="w-4 h-4 mr-2" />
                      Request Sent
                    </Button>
                  )}
                  
                  {isLoggedIn && !connectionLoading && connectionStatus === 'pending_received' && (
                    <Button
                      onClick={handleConnect}
                      className="bg-dna-copper hover:bg-dna-gold"
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Respond to Request
                    </Button>
                  )}
                  
                  {isLoggedIn && !connectionLoading && connectionStatus === 'accepted' && (
                    <>
                      <Button variant="outline" disabled className="text-dna-forest border-dna-emerald">
                        <UserCheck className="w-4 h-4 mr-2" />
                        Connected
                      </Button>
                      <Button onClick={handleMessage} variant="outline">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </>
                  )}
                  
                  {/* Share dropdown - only show if profile owner allows sharing */}
                  {allowSharing && (
                    <ProfileShareDropdown
                      username={username || ''}
                      fullName={profile.full_name}
                      profile={{
                        ...profile,
                        skills: tags?.skills || profile.skills,
                        focus_areas: tags?.focus_areas || profile.focus_areas,
                        interests: tags?.interests,
                        industries: tags?.industries || profile.industries,
                        display_name: profile.full_name,
                        professional_role: profile.profession || profile.headline,
                        visibility: profileBundle?.visibility,
                        isOwnerView: isOwnProfile,
                      }}
                      showDownload={true}
                      variant="outline"
                      size="icon"
                    />
                  )}
                </div>
              )}
              
              {/* Share dropdown for own profile - show outside the action buttons div */}
              {isOwnProfile && allowSharing && (
                <div className="flex flex-wrap gap-3 mb-6">
                  <ProfileShareDropdown
                    username={username || ''}
                    fullName={profile.full_name}
                    profile={{
                      ...profile,
                      skills: tags?.skills || profile.skills,
                      focus_areas: tags?.focus_areas || profile.focus_areas,
                      interests: tags?.interests,
                      industries: tags?.industries || profile.industries,
                      display_name: profile.full_name,
                      professional_role: profile.profession || profile.headline,
                      visibility: profileBundle?.visibility,
                      isOwnerView: isOwnProfile,
                    }}
                    showDownload={true}
                    variant="outline"
                    size="icon"
                  />
                </div>
              )}

              {/* My Connection to Africa */}
              {(profile.diaspora_status || profile.ethnic_heritage?.length > 0 || profile.african_causes?.length > 0 || profile.engagement_intentions?.length > 0) && (
                <div className="mb-6 p-4 rounded-lg bg-dna-forest/5 border border-dna-forest/10">
                  <h3 className="font-semibold mb-3 text-dna-forest">My Connection to Africa</h3>
                  {profile.diaspora_status && (
                    <p className="text-sm text-muted-foreground mb-2">
                      <span className="font-medium">Connection Type:</span> {profile.diaspora_status}
                    </p>
                  )}
                  {profile.ethnic_heritage && profile.ethnic_heritage.length > 0 && (
                    <div className="mb-2">
                      <span className="text-sm font-medium">Heritage:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {profile.ethnic_heritage.map((h: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">{h}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {profile.african_causes && profile.african_causes.length > 0 && (
                    <div className="mb-2">
                      <span className="text-sm font-medium">Causes I Care About:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {profile.african_causes.map((c: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">{c}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {profile.engagement_intentions && profile.engagement_intentions.length > 0 && (
                    <div>
                      <span className="text-sm font-medium">Here To:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {profile.engagement_intentions.map((e: string, i: number) => (
                          <Badge key={i} className="text-xs bg-dna-copper/10 text-dna-copper border-dna-copper/20">{e}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Diaspora Story */}
              {profile.diaspora_story && shouldShowSection('about') && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Diaspora Story</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{profile.diaspora_story}</p>
                </div>
              )}

              {/* Bio with read more */}
              {profile.bio && shouldShowSection('about') && (
                <AboutSection bio={profile.bio} />
              )}

              {/* Skills & Expertise */}
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                {profile.skills && profile.skills.length > 0 && shouldShowSection('skills') && (
                  <div>
                    <h3 className="font-semibold mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill: string, i: number) => (
                        <Badge key={i} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.focus_areas && profile.focus_areas.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Focus Areas</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.focus_areas.map((area: string, i: number) => (
                        <Badge key={i} variant="outline" className="border-dna-copper">{area}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.industries && profile.industries.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Industries</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.industries.map((industry: string, i: number) => (
                        <Badge key={i} variant="secondary">{industry}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.regional_expertise && profile.regional_expertise.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Regional Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.regional_expertise.map((region: string, i: number) => (
                        <Badge key={i} variant="outline">{region}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.interests && profile.interests?.length > 0 && shouldShowSection('interests') && (
                  <div>
                    <h3 className="font-semibold mb-3">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest: string, i: number) => (
                        <Badge key={i} variant="secondary">{interest}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Availability flags */}
              {profile.available_for && profile.available_for.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-3">Open To</h3>
                  <div className="flex flex-wrap gap-3">
                    {profile.available_for.map((item: string, i: number) => (
                      <Badge key={i} variant="outline">{item}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CTA Card for non-logged-in users */}
          {!isLoggedIn && (
            <Card className="mt-6 bg-gradient-to-r from-dna-forest to-dna-emerald text-white">
              <CardContent className="py-8 text-center">
                <h2 className="text-xl sm:text-2xl font-bold mb-3">
                  Join the Diaspora Network of Africa
                </h2>
                <p className="text-white/90 mb-6 max-w-md mx-auto">
                  Connect with {displayName} and thousands of other diaspora members. 
                  Build your network, share your story, and contribute to Africa's future.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    size="lg" 
                    className="bg-dna-copper hover:bg-dna-gold text-white"
                    asChild
                  >
                    <Link to="/auth?mode=signup">
                      Create Your Free Account
                    </Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="secondary"
                    className="bg-white text-dna-forest hover:bg-white/90"
                    asChild
                  >
                    <Link to="/about">
                      Learn More About DNA
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t mt-12 py-8 text-center text-sm text-muted-foreground">
          <div className="container">
            <p>© {new Date().getFullYear()} Diaspora Network of Africa. All rights reserved.</p>
            <div className="flex justify-center gap-4 mt-2">
              <Link to="/privacy" className="hover:underline">Privacy</Link>
              <Link to="/terms" className="hover:underline">Terms</Link>
              <Link to="/about" className="hover:underline">About</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default PublicProfilePage;
