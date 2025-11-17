import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { PenSquare, Sparkles, Users, Newspaper, Settings } from 'lucide-react';
import { EnhancedCreatePostDialog } from '@/components/posts/EnhancedCreatePostDialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileStrengthBanner } from '@/components/shared/ProfileStrengthBanner';
import LayoutController from '@/components/LayoutController';
import { useDashboardPreferences } from '@/hooks/useDashboardPreferences';
import { DashboardModules } from '@/components/feed/DashboardModules';
import { UniversalFeed } from '@/components/feed/UniversalFeed';
import { FeedTab } from '@/types/feed';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';


const DnaFeed = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FeedTab>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { preferences, isLoading: prefsLoading } = useDashboardPreferences();


  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to welcome wizard if no role set
  if (!profileLoading && profile && !profile.user_role) {
    navigate('/dna/welcome', { replace: true });
    return null;
  }

  if (!user || !profile) {
    return null;
  }

  // Left Column: Navigation placeholder
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

  // Center Column: Main Feed
  const centerColumn = (
    <div className="space-y-4">
      <ProfileStrengthBanner />
      
      {/* Feed Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Your DNA Feed
          </h1>
          <p className="text-muted-foreground text-sm">Activity from across the network</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dna/settings/dashboard')}
        >
          <Settings className="h-4 w-4 mr-2" />
          Customize
        </Button>
      </div>

      {/* Create Post Card */}
      <Card 
        className="p-4 cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => setShowCreateDialog(true)}
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback>{profile.display_name?.[0] || profile.username?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 bg-muted rounded-full px-4 py-2 text-muted-foreground">
            What's on your mind?
          </div>
          <Button size="icon" variant="ghost">
            <PenSquare className="w-5 h-5" />
          </Button>
        </div>
      </Card>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FeedTab)}>
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">
            <Newspaper className="h-4 w-4 mr-2" />
            All Posts
          </TabsTrigger>
          <TabsTrigger value="network" className="flex-1">
            <Users className="h-4 w-4 mr-2" />
            Network
          </TabsTrigger>
          <TabsTrigger value="my_posts" className="flex-1">
            <Sparkles className="h-4 w-4 mr-2" />
            My Posts
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Universal Feed */}
      <UniversalFeed
        viewerId={user.id}
        tab={activeTab}
        emptyMessage={
          activeTab === 'my_posts'
            ? "You haven't posted anything yet"
            : activeTab === 'network'
            ? "Your connections haven't posted yet"
            : 'No posts to show'
        }
        emptyAction={
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-dna-emerald hover:bg-dna-emerald/90 text-white mt-4"
          >
            <PenSquare className="h-4 w-4 mr-2" />
            Create Your First Post
          </Button>
        }
      />


      <EnhancedCreatePostDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        currentUserId={user?.id || ''}
        onSuccess={() => {
          setShowCreateDialog(false);
          // Feed will auto-refresh via real-time subscription
        }}
      />
    </div>
  );

  // Right Column: Personalized Modules
  const rightColumn = prefsLoading ? (
    <div className="space-y-4">
      <div className="h-32 bg-muted animate-pulse rounded-lg" />
      <div className="h-32 bg-muted animate-pulse rounded-lg" />
    </div>
  ) : (
    <DashboardModules
      visibleModules={preferences.visible_modules}
      collapsedModules={preferences.collapsed_modules}
      density={preferences.density}
    />
  );

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <LayoutController
        leftColumn={leftColumn}
        centerColumn={centerColumn}
        rightColumn={rightColumn}
      />
      <MobileBottomNav />
    </div>
  );
};

export default DnaFeed;
