import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TYPOGRAPHY } from '@/lib/typography.config';
import PatternBackground from '@/components/ui/PatternBackground';
import { 
  Users, 
  MessageSquare, 
  Briefcase, 
  Globe,
  TrendingUp,
  Calendar,
  Heart,
  MapPin,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MyEventsWidget } from '@/components/convene/MyEventsWidget';
import { RegisteredEventsWidget } from '@/components/convene/RegisteredEventsWidget';
import { calculateProfileCompletionPts } from '@/lib/profileCompletion';

const DNADashboard: React.FC = () => {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const completionScore = calculateProfileCompletionPts(profile);

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Ndebele pattern */}
      <PatternBackground pattern="ndebele" intensity="subtle" className="border-b bg-gradient-to-r from-dna-sunset/5 to-dna-purple/5 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || ''} />
                <AvatarFallback className="bg-dna-forest text-white">
                  {profile.full_name?.charAt(0) || profile.username?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className={TYPOGRAPHY.h3}>
                  Welcome back, {profile.full_name?.split(' ')[0] || 'Professional'}
                </h1>
                <p className={`${TYPOGRAPHY.body} text-muted-foreground`}>
                  Building bridges across the African diaspora
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/dna/:username">{/* Profile edit removed */}
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Complete Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </PatternBackground>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Profile Summary */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || ''} />
                    <AvatarFallback className="bg-dna-forest text-white text-lg">
                      {profile.full_name?.charAt(0) || profile.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className={TYPOGRAPHY.h4}>{profile.full_name || profile.username}</h3>
                  {profile.headline && (
                    <p className={`${TYPOGRAPHY.body} text-muted-foreground mt-1`}>{profile.headline}</p>
                  )}
                  
                  {/* Identity Badges */}
                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    {profile.country_of_origin && (
                      <Badge variant="secondary" className="text-xs">
                        <Globe className="w-3 h-3 mr-1" />
                        {profile.country_of_origin}
                      </Badge>
                    )}
                    {profile.location && (
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="w-3 h-3 mr-1" />
                        {profile.location}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Profile Completion */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={TYPOGRAPHY.body}>Profile Strength</span>
                    <span className={`${TYPOGRAPHY.body} text-muted-foreground`}>{completionScore}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-dna-emerald h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionScore}%` }}
                    />
                  </div>
                  {completionScore < 80 && (
                    <p className={`${TYPOGRAPHY.caption} mt-2`}>
                      Strengthen your profile to attract better connections
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className={TYPOGRAPHY.h5}>Your Network</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={`${TYPOGRAPHY.body} text-muted-foreground`}>Connections</span>
                    <span className={TYPOGRAPHY.statSmall}>{profile.connection_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${TYPOGRAPHY.body} text-muted-foreground`}>Profile Views</span>
                    <span className={TYPOGRAPHY.statSmall}>{profile.profile_views_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${TYPOGRAPHY.body} text-muted-foreground`}>Messages</span>
                    <span className={TYPOGRAPHY.statSmall}>0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Column - Main Content */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* DNA Pillars Navigation */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/dna/connect">
                <Card className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-dna-emerald hover:border-l-dna-emerald/80">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-dna-emerald/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-dna-emerald" />
                    </div>
                    <h3 className={TYPOGRAPHY.h6}>Connect</h3>
                    <p className={`${TYPOGRAPHY.caption} mt-1`}>Build your network</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/collaborate">
                <Card className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-dna-copper hover:border-l-dna-copper/80">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-dna-copper/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Briefcase className="w-6 h-6 text-dna-copper" />
                    </div>
                    <h3 className={TYPOGRAPHY.h6}>Collaborate</h3>
                    <p className={`${TYPOGRAPHY.caption} mt-1`}>Work together</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/dna/contribute">
                <Card className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-dna-gold hover:border-l-dna-gold/80">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-dna-gold/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Heart className="w-6 h-6 text-dna-gold" />
                    </div>
                    <h3 className={TYPOGRAPHY.h6}>Opportunities</h3>
                    <p className={`${TYPOGRAPHY.caption} mt-1`}>Find ways to contribute</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/dna/discover">{/* Discover route */}
                <Card className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-dna-mint hover:border-l-dna-mint/80">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-dna-mint/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-6 h-6 text-dna-mint" />
                    </div>
                    <h3 className={TYPOGRAPHY.h6}>Discover</h3>
                    <p className={`${TYPOGRAPHY.caption} mt-1`}>Explore opportunities</p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Recent Activity Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recent Activity
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 border border-border rounded-lg">
                    <div className="w-8 h-8 bg-dna-emerald/10 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-dna-emerald" />
                    </div>
                    <div className="flex-1">
                      <p className={TYPOGRAPHY.body}>
                        <span className="font-medium">Welcome to DNA!</span> Complete your profile to start connecting with the diaspora community.
                      </p>
                      <p className={`${TYPOGRAPHY.caption} mt-1`}>Just now</p>
                    </div>
                  </div>
                  
                  <div className="text-center py-8">
                    <p className={`${TYPOGRAPHY.body} text-muted-foreground`}>Start connecting to see activity here</p>
                    <Link to="/dna/connect">
                      <Button variant="outline" size="sm" className="mt-3">
                        Find Connections
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    <span className={TYPOGRAPHY.body}>Start Conversation</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span className={TYPOGRAPHY.body}>Create Event</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <Plus className="w-5 h-5" />
                    <span className={TYPOGRAPHY.body}>Share Update</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Recommendations */}
          <div className="lg:col-span-3 space-y-6">
            {/* Removed duplicate "People You May Know" - using ConnectionSuggestionsWidget in DashboardRightColumn instead */}

            {/* My Events */}
            <MyEventsWidget />
            
            {/* Registered Events */}
            <RegisteredEventsWidget />

            {/* Contribution Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle className={TYPOGRAPHY.h5}>Ways to Contribute</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <Heart className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className={`${TYPOGRAPHY.body} text-muted-foreground mb-3`}>
                    Find meaningful ways to give back to the community
                  </p>
                  <Link to="/dna/contribute">
                    <Button variant="outline" size="sm">
                      Explore Opportunities
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DNADashboard;