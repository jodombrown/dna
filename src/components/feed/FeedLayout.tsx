import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/CleanAuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Eye, FileText, Users, Calendar, TrendingUp, MessageCircle, Bell, ExternalLink, MapPin, Bookmark, Plus } from 'lucide-react';

interface FeedLayoutProps {
  children: React.ReactNode;
}

const FeedLayout: React.FC<FeedLayoutProps> = ({ children }) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNewsClick = (title: string) => {
    toast({
      title: "DNA Newsroom",
      description: `Opening article: ${title}`,
    });
    // For now, show a toast. In production, this would navigate to the full article
  };

  const handleShowMoreNews = () => {
    navigate('/newsletters');
  };

  const handleFeaturedEventClick = () => {
    navigate('/events');
  };

  const handleFeaturedCommunityClick = () => {
    navigate('/communities');
  };

  const handleProfileClick = (name: string) => {
    navigate('/search?type=professionals');
  };

  const handleViewAllMessages = () => {
    navigate('/messages');
  };

  const handleFindProfessionals = () => {
    navigate('/search');
  };

  const handleQuickLinkClick = (link: string) => {
    if (link === 'events') {
      navigate('/events');
    } else if (link === 'newsletters') {
      navigate('/newsletters');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main container with fixed height and proper scroll areas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full overflow-hidden">
        <div className="grid grid-cols-12 gap-6 h-full">
          
          {/* Left Sidebar - Profile & Activity - Scrollable */}
          <div className="col-span-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="space-y-4">
              {/* Profile Card */}
              <Card className="overflow-hidden sticky top-0 z-10 bg-white">
                <div className="h-16 bg-gradient-to-r from-dna-emerald to-dna-forest"></div>
                <CardContent className="p-4 relative">
                  <div className="flex flex-col items-center -mt-8">
                    <Avatar className="w-16 h-16 border-4 border-white">
                      <AvatarImage src={profile?.avatar_url || profile?.profile_picture_url} />
                      <AvatarFallback className="bg-dna-mint text-dna-forest text-lg">
                        {profile?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="mt-2 font-semibold text-center text-sm">
                      {profile?.display_name || profile?.full_name || 'DNA Member'}
                    </h3>
                    <p className="text-xs text-gray-500 text-center">
                      {profile?.profession || 'Professional'}
                    </p>
                    {profile?.company && (
                      <p className="text-xs text-gray-400 text-center">
                        {profile.company}
                      </p>
                    )}
                    {profile?.location && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-400">{profile.location}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Profile viewers</span>
                      <span className="text-dna-emerald font-medium">12</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Post impressions</span>
                      <span className="text-dna-emerald font-medium">48</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Connections</span>
                      <span className="text-dna-emerald font-medium">156</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500 mb-2">Contribution Stats</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Posts shared</span>
                        <span className="font-medium">23</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Events attended</span>
                        <span className="font-medium">8</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Initiatives supported</span>
                        <span className="font-medium">5</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500 mb-2">Grow your diaspora network</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs"
                      onClick={handleFindProfessionals}
                    >
                      Find professionals
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Saved Content */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Bookmark className="w-4 h-4 text-dna-emerald" />
                    <h3 className="font-semibold text-sm">Saved Content</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-xs cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <p className="font-medium text-gray-900 line-clamp-2">African Tech Summit 2025 - Registration Open</p>
                      <p className="text-gray-500 mt-1">by TechAfrica • 2h ago</p>
                      <Badge variant="outline" className="text-xs mt-1">Event</Badge>
                    </div>
                    <div className="text-xs cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <p className="font-medium text-gray-900 line-clamp-2">Investment Opportunities in AgriTech</p>
                      <p className="text-gray-500 mt-1">by Dr. Kwame Asante • 1d ago</p>
                      <Badge variant="outline" className="text-xs mt-1">Article</Badge>
                    </div>
                    <div className="text-xs cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <p className="font-medium text-gray-900 line-clamp-2">Healthcare Innovation Fund Launch</p>
                      <p className="text-gray-500 mt-1">by HealthTech Africa • 3d ago</p>
                      <Badge variant="outline" className="text-xs mt-1">Opportunity</Badge>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-4 text-xs"
                    onClick={() => navigate('/saved')}
                  >
                    View all saved
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div 
                    className="flex items-center gap-3 text-sm text-gray-600 hover:text-dna-emerald cursor-pointer"
                    onClick={() => handleQuickLinkClick('events')}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Events</span>
                  </div>
                  <div 
                    className="flex items-center gap-3 text-sm text-gray-600 hover:text-dna-emerald cursor-pointer"
                    onClick={() => handleQuickLinkClick('newsletters')}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Newsletters</span>
                  </div>
                  <div 
                    className="flex items-center gap-3 text-sm text-gray-600 hover:text-dna-emerald cursor-pointer"
                    onClick={() => navigate('/communities')}
                  >
                    <Users className="w-4 h-4" />
                    <span>Communities</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs">
                      <div className="w-2 h-2 bg-dna-emerald rounded-full"></div>
                      <span className="text-gray-600">Liked a post by Amara Okafor</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="w-2 h-2 bg-dna-copper rounded-full"></div>
                      <span className="text-gray-600">Saved an article about AgriTech</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="w-2 h-2 bg-dna-mint rounded-full"></div>
                      <span className="text-gray-600">Joined Healthcare Innovation group</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Center Feed - Main Content with Sticky Post Creator */}
          <div className="col-span-6 flex flex-col h-full">
            {/* Scrollable Feed Content - children includes both post creator and feed */}
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="space-y-6">
                {children}
              </div>
            </div>
          </div>

          {/* Right Sidebar - News, Events, Networking - Scrollable */}
          <div className="col-span-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="space-y-4">
              
              {/* DNA Newsroom */}
              <Card className="sticky top-0 z-10 bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-semibold text-sm">DNA Newsroom</h3>
                    <TrendingUp className="w-4 h-4 text-dna-emerald" />
                  </div>
                  
                  <div className="space-y-3">
                    <div 
                      className="text-xs text-gray-600 hover:text-gray-900 cursor-pointer"
                      onClick={() => handleNewsClick("African tech startups raise $2.3B in Q3")}
                    >
                      <p className="font-medium">African tech startups raise $2.3B in Q3</p>
                      <p className="text-gray-500">2h ago • 1,245 readers</p>
                    </div>
                    <div 
                      className="text-xs text-gray-600 hover:text-gray-900 cursor-pointer"
                      onClick={() => handleNewsClick("Diaspora investment fund launches")}
                    >
                      <p className="font-medium">Diaspora investment fund launches</p>
                      <p className="text-gray-500">4h ago • 892 readers</p>
                    </div>
                    <div 
                      className="text-xs text-gray-600 hover:text-gray-900 cursor-pointer"
                      onClick={() => handleNewsClick("New trade agreements benefit African markets")}
                    >
                      <p className="font-medium">New trade agreements benefit African markets</p>
                      <p className="text-gray-500">6h ago • 654 readers</p>
                    </div>
                    <div 
                      className="text-xs text-gray-600 hover:text-gray-900 cursor-pointer"
                      onClick={() => handleNewsClick("Women in tech leadership rising")}
                    >
                      <p className="font-medium">Women in tech leadership rising</p>
                      <p className="text-gray-500">1d ago • 1,567 readers</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-4 text-xs"
                    onClick={handleShowMoreNews}
                  >
                    Show more
                  </Button>
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4 text-dna-emerald" />
                    <h3 className="font-semibold text-sm">Upcoming Events</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer" onClick={handleFeaturedEventClick}>
                      <img 
                        src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop" 
                        alt="African Tech Summit"
                        className="w-full h-20 object-cover rounded mb-2"
                      />
                      <p className="text-xs font-medium line-clamp-2">African Tech Summit 2025</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-500">March 15, 2025</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-500">Lagos, Nigeria</p>
                      </div>
                      <p className="text-xs text-dna-emerald mt-1">250+ attending</p>
                    </div>
                    
                    <div className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer" onClick={handleFeaturedEventClick}>
                      <img 
                        src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=200&fit=crop" 
                        alt="Diaspora Investment Forum"
                        className="w-full h-20 object-cover rounded mb-2"
                      />
                      <p className="text-xs font-medium line-clamp-2">Diaspora Investment Forum</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-500">March 22, 2025</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-500">Virtual</p>
                      </div>
                      <p className="text-xs text-dna-emerald mt-1">180+ attending</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-4 text-xs"
                    onClick={handleFeaturedEventClick}
                  >
                    View all events
                  </Button>
                </CardContent>
              </Card>

              {/* People to Follow */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-dna-emerald" />
                    <h3 className="font-semibold text-sm">People to Follow</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b829?w=150" />
                        <AvatarFallback>AO</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium line-clamp-1">Dr. Amara Okafor</p>
                        <p className="text-xs text-gray-500 line-clamp-1">AI Research Scientist</p>
                        <p className="text-xs text-gray-400 line-clamp-1">AgriTech Solutions</p>
                        <p className="text-xs text-dna-emerald">12 mutual</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2 h-6 text-xs"
                          onClick={() => handleProfileClick("Dr. Amara Okafor")}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Follow
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" />
                        <AvatarFallback>KA</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium line-clamp-1">Prof. Kwame Asante</p>
                        <p className="text-xs text-gray-500 line-clamp-1">Financial Technology</p>
                        <p className="text-xs text-gray-400 line-clamp-1">University of Ghana</p>
                        <p className="text-xs text-dna-emerald">8 mutual</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2 h-6 text-xs"
                          onClick={() => handleProfileClick("Prof. Kwame Asante")}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Follow
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Today's Featured */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-4">Today's Featured</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-dna-mint rounded flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-dna-forest" />
                      </div>
                      <div>
                        <p className="text-xs font-medium">African Tech Summit 2025</p>
                        <p className="text-xs text-gray-500">Register now for early bird pricing</p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2 text-xs"
                          onClick={handleFeaturedEventClick}
                        >
                          Learn more
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-dna-copper rounded flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-medium">New Community: HealthTech Africa</p>
                        <p className="text-xs text-gray-500">Join 250+ healthcare innovators</p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2 text-xs"
                          onClick={handleFeaturedCommunityClick}
                        >
                          Join now
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Messaging Preview */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">Messages</h3>
                    <MessageCircle className="w-4 h-4 text-dna-emerald" />
                  </div>
                  
                  <div className="space-y-3">
                    <div 
                      className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      onClick={() => handleProfileClick("Dr. Amara Okafor")}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b829?w=150" />
                        <AvatarFallback>AO</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">Dr. Amara Okafor</p>
                        <p className="text-xs text-gray-500 truncate">Thanks for the connection...</p>
                      </div>
                      <div className="w-2 h-2 bg-dna-emerald rounded-full"></div>
                    </div>
                    
                    <div 
                      className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      onClick={() => handleProfileClick("Prof. Kwame Asante")}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" />
                        <AvatarFallback>KA</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">Prof. Kwame Asante</p>
                        <p className="text-xs text-gray-500 truncate">Great insights on the AgriTech...</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-4 text-xs"
                    onClick={handleViewAllMessages}
                  >
                    View all messages
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedLayout;