import React from 'react';
import { useAuth } from '@/contexts/CleanAuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, FileText, Users, Calendar, TrendingUp, MessageCircle, Bell } from 'lucide-react';

interface FeedLayoutProps {
  children: React.ReactNode;
}

const FeedLayout: React.FC<FeedLayoutProps> = ({ children }) => {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Sidebar - Profile & Navigation */}
          <div className="col-span-3 space-y-4">
            
            {/* Profile Card */}
            <Card className="overflow-hidden">
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
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500 mb-2">Grow your network faster</p>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Connect with alumni
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600 hover:text-dna-emerald cursor-pointer">
                  <Users className="w-4 h-4" />
                  <span>My Communities</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 hover:text-dna-emerald cursor-pointer">
                  <Calendar className="w-4 h-4" />
                  <span>Events</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 hover:text-dna-emerald cursor-pointer">
                  <FileText className="w-4 h-4" />
                  <span>Newsletters</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Feed - Main Content */}
          <div className="col-span-6">
            {children}
          </div>

          {/* Right Sidebar - News & Activity */}
          <div className="col-span-3 space-y-4">
            
            {/* DNA News */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-semibold text-sm">DNA Network News</h3>
                  <TrendingUp className="w-4 h-4 text-dna-emerald" />
                </div>
                
                <div className="space-y-3">
                  <div className="text-xs text-gray-600 hover:text-gray-900 cursor-pointer">
                    <p className="font-medium">African tech startups raise $2.3B in Q3</p>
                    <p className="text-gray-500">2h ago • 1,245 readers</p>
                  </div>
                  <div className="text-xs text-gray-600 hover:text-gray-900 cursor-pointer">
                    <p className="font-medium">Diaspora investment fund launches</p>
                    <p className="text-gray-500">4h ago • 892 readers</p>
                  </div>
                  <div className="text-xs text-gray-600 hover:text-gray-900 cursor-pointer">
                    <p className="font-medium">New trade agreements benefit African markets</p>
                    <p className="text-gray-500">6h ago • 654 readers</p>
                  </div>
                  <div className="text-xs text-gray-600 hover:text-gray-900 cursor-pointer">
                    <p className="font-medium">Women in tech leadership rising</p>
                    <p className="text-gray-500">1d ago • 1,567 readers</p>
                  </div>
                </div>
                
                <Button variant="ghost" size="sm" className="w-full mt-4 text-xs">
                  Show more
                </Button>
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
                      <Button size="sm" variant="outline" className="mt-2 text-xs">
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
                      <Button size="sm" variant="outline" className="mt-2 text-xs">
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
                  <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
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
                  
                  <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
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
                
                <Button variant="ghost" size="sm" className="w-full mt-4 text-xs">
                  View all messages
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedLayout;