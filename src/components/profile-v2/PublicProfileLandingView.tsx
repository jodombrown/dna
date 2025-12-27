/**
 * Public Profile Landing View
 * A focused, visually appealing profile view for non-logged-in visitors.
 * Designed to intrigue visitors and drive DNA sign-ups.
 */

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Globe, 
  Briefcase, 
  UserPlus, 
  ArrowLeft,
  Sparkles,
  Users,
  Target,
  Heart
} from 'lucide-react';
import { ProfileV2Bundle } from '@/types/profileV2';
import { BANNER_GRADIENTS, BannerGradientKey } from '@/lib/constants/bannerGradients';
import { PublicProfileSEO } from '@/components/public-profile';

interface PublicProfileLandingViewProps {
  bundle: ProfileV2Bundle;
}

const PublicProfileLandingView: React.FC<PublicProfileLandingViewProps> = ({ bundle }) => {
  const navigate = useNavigate();
  const { profile, tags } = bundle;

  // Get banner style
  const getBannerStyle = (): React.CSSProperties => {
    const bannerType = profile.banner_type || 'gradient';
    const bannerGradient = profile.banner_gradient || 'dna';
    const bannerUrl = profile.banner_url;

    if (bannerType === 'image' && bannerUrl) {
      return {
        backgroundImage: `url(${bannerUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }
    
    if (bannerType === 'gradient' && bannerGradient) {
      const gradient = BANNER_GRADIENTS[bannerGradient as BannerGradientKey];
      return { background: gradient?.css || BANNER_GRADIENTS.dna.css };
    }
    
    return { background: BANNER_GRADIENTS.dna.css };
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    return (profile?.full_name || profile?.username || 'DN')
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Collect tags to display
  const displaySkills = tags?.skills?.slice(0, 4) || [];
  const displayInterests = tags?.interests?.slice(0, 4) || tags?.impact_areas?.slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Meta Tags */}
      <PublicProfileSEO
        username={profile.username}
        fullName={profile.full_name || profile.username || 'DNA Member'}
        firstName={profile.first_name}
        lastName={profile.last_name}
        headline={profile.headline || profile.professional_role}
        bio={profile.bio}
        avatarUrl={profile.avatar_url}
        company={profile.company}
        linkedinUrl={(profile as any).linkedin_url}
        websiteUrl={(profile as any).website_url}
        memberSince={profile.created_at}
      />

      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold text-sm">DNA</span>
          </Link>
          <Button 
            onClick={() => navigate('/auth')}
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Join DNA
          </Button>
        </div>
      </header>

      {/* Hero Banner */}
      <div
        className="h-40 sm:h-52 md:h-64 w-full relative pt-14"
        style={getBannerStyle()}
      >
        {/* Gradient overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        {/* Cultural pattern overlay - subtle */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-10">
        {/* Avatar & Name Section */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-4">
            <div 
              className="p-1 rounded-full"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--dna-emerald)), hsl(var(--dna-forest)))',
                boxShadow: '0 4px 20px hsla(183, 28%, 28%, 0.3)'
              }}
            >
              <Avatar className="w-28 h-28 sm:w-36 sm:h-36 border-4 border-background">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name} />
                <AvatarFallback className="text-2xl sm:text-3xl font-bold bg-primary text-primary-foreground">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
            {profile.full_name || profile.username}
          </h1>
          <p className="text-muted-foreground text-sm mb-3">@{profile.username}</p>

          {/* Headline */}
          {profile.headline && (
            <p className="text-base sm:text-lg text-foreground max-w-lg mb-4">
              {profile.headline}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-6">
            {profile.professional_role && (
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" />
                <span>{profile.professional_role}</span>
                {profile.company && (
                  <span className="text-muted-foreground/70">at {profile.company}</span>
                )}
              </div>
            )}
            {(profile.location || profile.current_country) && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>Based in {profile.location || profile.current_country}</span>
              </div>
            )}
            {profile.country_of_origin && (
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                <span>From {profile.country_of_origin}</span>
              </div>
            )}
          </div>

          {/* Primary CTA */}
          <Button 
            onClick={() => navigate('/auth')}
            size="lg"
            className="bg-primary hover:bg-primary/90 shadow-lg px-8"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Connect on DNA
          </Button>
        </div>

        {/* About Section */}
        {profile.bio && (
          <Card className="mb-6 max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                About
              </h2>
              <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Skills & Interests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
          {displaySkills.length > 0 && (
            <Card>
              <CardContent className="pt-5">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                  <Target className="w-4 h-4" />
                  Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {displaySkills.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {displayInterests.length > 0 && (
            <Card>
              <CardContent className="pt-5">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                  <Heart className="w-4 h-4" />
                  Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {displayInterests.map((interest, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* DNA Value Proposition */}
        <Card className="max-w-2xl mx-auto mb-12 bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-primary/20">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Join the Diaspora Network of Africa
            </h3>
            <p className="text-muted-foreground text-sm mb-5 max-w-md mx-auto">
              Connect with professionals like {profile.first_name || profile.full_name?.split(' ')[0] || 'this member'} and 
              thousands of others building bridges between Africa and its global diaspora.
            </p>
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-primary hover:bg-primary/90"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Get Started - It's Free
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center">
          <Link 
            to="/" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            © {new Date().getFullYear()} Diaspora Network of Africa
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default PublicProfileLandingView;
