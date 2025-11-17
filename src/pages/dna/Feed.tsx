import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { PenSquare, Users, Image as ImageIcon, Video, Link2 } from 'lucide-react';
import { EnhancedCreatePostDialog } from '@/components/posts/EnhancedCreatePostDialog';
import { UniversalFeed } from '@/components/feed/UniversalFeed';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileStrengthBanner } from '@/components/shared/ProfileStrengthBanner';
import LayoutController from '@/components/LayoutController';
import { useDashboardPreferences } from '@/hooks/useDashboardPreferences';
import { DashboardModules } from '@/components/feed/DashboardModules';

/**
 * DNA | FEED - Canonical Home Feed
 * 
 * This is the main activity stream for DNA platform.
 * It shows unified content from all 5Cs: Connect, Convene, Collaborate, Contribute, Convey.
 * 
 * Powered by UniversalFeed component with tabs: All, Network, My Posts.
 */
const DnaFeed = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { preferences, isLoading: prefsLoading } = useDashboardPreferences();

  // Safe redirect to welcome if role missing
  useEffect(() => {
    if (!profileLoading && profile && !profile.user_role) {
      navigate('/dna/welcome', { replace: true });
    }
  }, [profileLoading, profile, navigate]);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to welcome wizard if no role set
  // (move navigate to useEffect to avoid render-time navigation)
  // handled below in useEffect


  if (!user || !profile) {
    return null;
  }

  // Left Column: Navigation
  const leftColumn = (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-semibold mb-2">Quick Nav</h3>
        <div className="space-y-2 text-sm">
          <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/dna/connect')}>
            <Users className="w-4 h-4 mr-2" />
            Network
          </Button>
        </div>
      </Card>
    </div>
  );

  // Center Column: Universal Feed
  const centerColumn = (
    <div className="space-y-6">
      <ProfileStrengthBanner />

      {/* Create Post Card */}
      <Card className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback>
              {profile.full_name
                ?.split(' ')
                .map((n) => n[0])
                .join('') || profile.username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex-1 text-left px-4 py-2 rounded-full bg-muted hover:bg-muted/80 transition-colors text-muted-foreground"
          >
            Start a post...
          </button>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCreateDialog(true)}
            className="flex-1 text-dna-gold hover:text-dna-gold/80"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Photo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCreateDialog(true)}
            className="flex-1 text-dna-terracotta hover:text-dna-terracotta/80"
          >
            <Video className="w-4 h-4 mr-2" />
            Video
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCreateDialog(true)}
            className="flex-1 text-dna-emerald hover:text-dna-emerald/80"
          >
            <Link2 className="w-4 h-4 mr-2" />
            Link
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCreateDialog(true)}
            className="flex-1"
          >
            <PenSquare className="w-4 h-4 mr-2" />
            Write
          </Button>
        </div>
      </Card>

      {/* Universal Feed Component - The canonical feed engine */}
      <UniversalFeed 
        showTabs={true}
        onUpdate={() => {
          // Feed updated - modules could refresh here if needed
        }}
      />
    </div>
  );

  // Right Column: Dashboard Modules
  const rightColumn = (
    <div className="space-y-6">
      {!prefsLoading && preferences && (
        <DashboardModules 
          visibleModules={preferences.visible_modules}
          collapsedModules={preferences.collapsed_modules}
          density={preferences.density}
        />
      )}
    </div>
  );

  return (
    <>
      <LayoutController
        leftColumn={leftColumn}
        centerColumn={centerColumn}
        rightColumn={rightColumn}
      />

      <EnhancedCreatePostDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        currentUserId={user.id}
        onSuccess={() => {
          // Feed will auto-refresh via real-time subscription
        }}
      />
    </>
  );
};

export default DnaFeed;
