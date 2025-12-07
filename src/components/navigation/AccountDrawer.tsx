import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Edit, Share2, FileText, Bookmark, Users, Calendar, Settings, HelpCircle, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useAccountDrawer } from '@/contexts/AccountDrawerContext';
import { toast } from 'sonner';
import { profileRoute } from '@/lib/profileRoute';

export const AccountDrawer: React.FC = () => {
  const { isOpen, close } = useAccountDrawer();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();

  const handleViewProfile = () => {
    if (profile?.username) {
      navigate(profileRoute(profile));
      close();
    }
  };

  const handleEditProfile = () => {
    navigate('/dna/profile/edit');
    close();
  };

  const handleShareProfile = () => {
    if (profile?.username) {
      const profileUrl = `${window.location.origin}${profileRoute(profile)}`;
      navigator.clipboard.writeText(profileUrl);
      toast.success('Profile link copied to clipboard');
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    close();
  };

  const handleSignOut = async () => {
    await signOut();
    close();
    navigate('/');
  };

  if (!user || !profile) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Account</h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Identity Block */}
          <div className="p-6 space-y-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback className="text-2xl">
                {profile.display_name?.[0] || profile.username?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <h3 className="text-xl font-semibold">{profile.display_name || profile.username}</h3>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
              
              {profile.location && (
                <p className="text-sm text-muted-foreground">
                  {profile.location}
                </p>
              )}

              {profile.bio && (
                <p className="text-sm text-foreground pt-2 line-clamp-2">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Primary Actions */}
            <div className="space-y-2 pt-2">
              <Button 
                onClick={handleViewProfile}
                className="w-full justify-start"
                variant="default"
              >
                <User className="h-4 w-4 mr-2" />
                View full profile
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={handleEditProfile}
                  variant="outline"
                  className="justify-start"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  onClick={handleShareProfile}
                  variant="outline"
                  className="justify-start"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Activity Shortcuts */}
          <div className="p-4 space-y-1">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-2">
              My Activity
            </h4>
            
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handleNavigation('/dna/feed?tab=my_posts')}
            >
              <FileText className="h-4 w-4 mr-3" />
              My posts & updates
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handleNavigation('/dna/convey?tab=my_stories')}
            >
              <FileText className="h-4 w-4 mr-3" />
              My stories
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handleNavigation('/dna/feed?tab=bookmarks')}
            >
              <Bookmark className="h-4 w-4 mr-3" />
              Saved items
            </Button>
          </div>

          <Separator />

          {/* Spaces & Events */}
          <div className="p-4 space-y-1">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-2">
              Collaborate
            </h4>
            
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handleNavigation('/dna/collaborate')}
            >
              <Users className="h-4 w-4 mr-3" />
              My spaces
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handleNavigation('/dna/convene/events')}
            >
              <Calendar className="h-4 w-4 mr-3" />
              My events
            </Button>
          </div>

          <Separator />

          {/* Account Section */}
          <div className="p-4 space-y-1">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-2">
              Account
            </h4>
            
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handleNavigation('/dna/settings')}
            >
              <Settings className="h-4 w-4 mr-3" />
              Settings & preferences
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => window.open('mailto:support@dnanetwork.org', '_blank')}
            >
              <HelpCircle className="h-4 w-4 mr-3" />
              Help & feedback
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
