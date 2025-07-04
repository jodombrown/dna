import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  FileText, 
  Calendar, 
  TrendingUp, 
  MessageCircle, 
  Users,
  Bookmark,
  Plus,
  MapPin,
  Building,
  Hash
} from 'lucide-react';
import { 
  mockCurrentUser, 
  mockEvents, 
  mockSuggestedUsers, 
  mockTrendingHashtags,
  mockSavedContent,
  mockInitiatives 
} from '@/data/mockFeedData';

interface MockFeedLayoutProps {
  children: React.ReactNode;
}

const MockFeedLayout: React.FC<MockFeedLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Sidebar - Profile & Saved Content */}
          <div className="col-span-3 space-y-4">
            
            {/* Current User Profile Card */}
            <Card className="overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-dna-emerald to-dna-forest"></div>
              <CardContent className="p-4 relative">
                <div className="flex flex-col items-center -mt-8">
                  <Avatar className="w-16 h-16 border-4 border-white">
                    <AvatarImage src={mockCurrentUser.avatar} />
                    <AvatarFallback className="bg-dna-mint text-dna-forest text-lg">
                      {mockCurrentUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="mt-2 font-semibold text-center text-sm">
                    {mockCurrentUser.name}
                  </h3>
                  <p className="text-xs text-gray-500 text-center">
                    {mockCurrentUser.title}
                  </p>
                  <p className="text-xs text-gray-400 text-center">
                    {mockCurrentUser.company}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-400">{mockCurrentUser.location}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Profile viewers</span>
                    <span className="text-dna-emerald font-medium">142</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Post impressions</span>
                    <span className="text-dna-emerald font-medium">2.1K</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Connections</span>
                    <span className="text-dna-emerald font-medium">{mockCurrentUser.connections}</span>
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
                  {mockSavedContent.slice(0, 3).map((item) => (
                    <div key={item.id} className="text-xs cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <p className="font-medium text-gray-900 line-clamp-2">{item.title}</p>
                      <p className="text-gray-500 mt-1">by {item.author} • {item.timeAgo}</p>
                      <Badge variant="outline" className="text-xs mt-1">{item.type}</Badge>
                    </div>
                  ))}
                </div>
                
                <Button variant="ghost" size="sm" className="w-full mt-4 text-xs">
                  View all saved
                </Button>
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

          {/* Center Feed - Main Content */}
          <div className="col-span-6">
            {children}
          </div>

          {/* Right Sidebar - Events, Suggested Users, Trending */}
          <div className="col-span-3 space-y-4">
            
            {/* Upcoming Events */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-dna-emerald" />
                  <h3 className="font-semibold text-sm">Upcoming Events</h3>
                </div>
                
                <div className="space-y-4">
                  {mockEvents.slice(0, 2).map((event) => (
                    <div key={event.id} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                      <img 
                        src={event.image} 
                        alt={event.title}
                        className="w-full h-20 object-cover rounded mb-2"
                      />
                      <p className="text-xs font-medium line-clamp-2">{event.title}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-500">{event.location}</p>
                      </div>
                      <p className="text-xs text-dna-emerald mt-1">{event.attendees} attending</p>
                    </div>
                  ))}
                </div>
                
                <Button variant="ghost" size="sm" className="w-full mt-4 text-xs">
                  View all events
                </Button>
              </CardContent>
            </Card>

            {/* Suggested Users */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-dna-emerald" />
                  <h3 className="font-semibold text-sm">People to Follow</h3>
                </div>
                
                <div className="space-y-3">
                  {mockSuggestedUsers.map((user) => (
                    <div key={user.id} className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium line-clamp-1">{user.name}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{user.title}</p>
                        <p className="text-xs text-gray-400 line-clamp-1">{user.company}</p>
                        <p className="text-xs text-dna-emerald">{user.mutualConnections} mutual</p>
                        <Button variant="outline" size="sm" className="mt-2 h-6 text-xs">
                          <Plus className="w-3 h-3 mr-1" />
                          Follow
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trending Hashtags */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Hash className="w-4 h-4 text-dna-emerald" />
                  <h3 className="font-semibold text-sm">Trending Now</h3>
                </div>
                
                <div className="space-y-2">
                  {mockTrendingHashtags.slice(0, 5).map((hashtag, index) => (
                    <div key={hashtag.tag} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <div>
                        <p className="text-xs font-medium">#{hashtag.tag}</p>
                        <p className="text-xs text-gray-500">{hashtag.posts} posts</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* DNA Spotlight */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-dna-emerald" />
                  <h3 className="font-semibold text-sm">DNA Spotlight</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <Avatar className="w-12 h-12 mx-auto mb-2">
                      <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b04c9e18?w=150" />
                      <AvatarFallback>AO</AvatarFallback>
                    </Avatar>
                    <p className="text-xs font-medium">Featured Contributor</p>
                    <p className="text-xs text-dna-emerald">Amara Okafor</p>
                    <p className="text-xs text-gray-500 mt-1">AI innovator helping 1000+ farmers with crop prediction technology</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="text-xs font-medium mb-2">Active Initiative</p>
                    <div className="bg-dna-mint/20 p-3 rounded-lg">
                      <p className="text-xs font-medium">{mockInitiatives[0].title}</p>
                      <p className="text-xs text-gray-600 mt-1">{mockInitiatives[0].description}</p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-dna-emerald">{mockInitiatives[0].supporters} supporters</p>
                        <Badge variant="outline" className="text-xs">{mockInitiatives[0].impactArea}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockFeedLayout;