
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, Plus, Clock, CheckCircle } from 'lucide-react';
import MobileTouchButton from '@/components/ui/mobile-touch-button';
import MobileOptimizedCard from '@/components/ui/mobile-optimized-card';
import MobileResponsiveGrid from '@/components/ui/mobile-responsive-grid';
import { searchCommunities, requestToJoinCommunity } from '@/services/communityService';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface CommunitiesTabProps {
  searchTerm: string;
}

const CommunitiesTab: React.FC<CommunitiesTabProps> = ({ searchTerm }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Fetch communities from the database
  const { data: allCommunities = [], isLoading, refetch } = useQuery({
    queryKey: ['communities', searchTerm],
    queryFn: () => searchCommunities(searchTerm),
    enabled: true
  });

  const handleJoinCommunity = async (communityId: string, isAlreadyMember: boolean, membershipStatus?: string) => {
    if (isAlreadyMember) {
      navigate(`/community/${communityId}`);
      return;
    }

    if (membershipStatus === 'pending') {
      toast({
        title: "Request Pending",
        description: "Your join request is still pending approval.",
      });
      return;
    }

    try {
      await requestToJoinCommunity(communityId);
      toast({
        title: "Join Request Sent",
        description: "Your request to join this community has been sent for approval.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send join request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getJoinButtonText = (community: any) => {
    if (community.is_member) return "View Community";
    if (community.user_membership?.status === 'pending') return "Request Pending";
    return "Request to Join";
  };

  const getJoinButtonIcon = (community: any) => {
    if (community.is_member) return MessageSquare;
    if (community.user_membership?.status === 'pending') return Clock;
    return Plus;
  };

  // Fallback mock data if no real communities exist
  const mockCommunities = [
    {
      id: '1',
      name: 'African Tech Leaders',
      description: 'A community of senior technology leaders from across the African diaspora sharing insights and opportunities.',
      category: 'Technology',
      memberCount: 450,
      isFeatured: true,
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '2',
      name: 'Climate Solutions Africa',
      description: 'Professionals working on climate change solutions and environmental sustainability across Africa.',
      category: 'Environment',
      memberCount: 280,
      isFeatured: true,
      image: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '3',
      name: 'African Women in Finance',
      description: 'Empowering African women in financial services through mentorship and professional development.',
      category: 'Finance',
      memberCount: 320,
      isFeatured: false,
      image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=150&h=150&fit=crop&crop=face'
    },
    // Additional communities (shown when "View More" is clicked)
    {
      id: '4',
      name: 'Diaspora Investment Circle',
      description: 'Connecting African diaspora investors with high-impact investment opportunities across Africa.',
      category: 'Business',
      memberCount: 890,
      isFeatured: true,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '5',
      name: 'Women in African Tech',
      description: 'Empowering African women in technology through mentorship and networking.',
      category: 'Technology',
      memberCount: 650,
      isFeatured: false,
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '6',
      name: 'African Healthcare Innovation',
      description: 'Advancing healthcare solutions and medical innovation across Africa.',
      category: 'Healthcare',
      memberCount: 420,
      isFeatured: false,
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '7',
      name: 'Sustainable Energy Africa',
      description: 'Promoting renewable energy and sustainable development across African communities.',
      category: 'Energy',
      memberCount: 380,
      isFeatured: false,
      image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '8',
      name: 'African Creative Industries',
      description: 'Supporting artists, designers, and creative professionals in the diaspora.',
      category: 'Creative',
      memberCount: 720,
      isFeatured: false,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '9',
      name: 'Financial Inclusion Africa',
      description: 'Driving financial technology and inclusion initiatives across African markets.',
      category: 'Finance',
      memberCount: 540,
      isFeatured: false,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '10',
      name: 'African Agriculture Tech',
      description: 'Modernizing agriculture through technology and sustainable farming practices.',
      category: 'Agriculture',
      memberCount: 310,
      isFeatured: false,
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '11',
      name: 'African Youth Development',
      description: 'Mentoring and supporting the next generation of African leaders.',
      category: 'Education',
      memberCount: 950,
      isFeatured: false,
      image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '12',
      name: 'Pan-African Legal Network',
      description: 'Connecting legal professionals working on African development and policy.',
      category: 'Legal',
      memberCount: 260,
      isFeatured: false,
      image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '13',
      name: 'African Media & Communications',
      description: 'Journalists, content creators, and media professionals telling African stories.',
      category: 'Media',
      memberCount: 480,
      isFeatured: false,
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face'
    }
  ];

  const [showAll, setShowAll] = React.useState(false);
  const displayCommunities = allCommunities.length > 0 ? allCommunities : mockCommunities;
  const communities = showAll ? displayCommunities : displayCommunities.slice(0, 3);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dna-emerald"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-gray-600 text-sm sm:text-base">
          Showing {communities.length} communities {searchTerm && `matching "${searchTerm}"`}
        </p>
        <MobileTouchButton className="bg-dna-emerald hover:bg-dna-forest text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Community
        </MobileTouchButton>
      </div>

      <MobileResponsiveGrid cols={{ mobile: 1, tablet: 1, desktop: 1 }} gap="md">
        {communities.map((community) => (
          <MobileOptimizedCard key={community.id} padding="md" touchOptimized={true}>
            <div className="space-y-4">
              <div className="flex items-start gap-3 sm:gap-4">
                <img
                  src={community.image}
                  alt={community.name}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1 min-w-0">
                       <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate mb-1">
                        {community.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {community.category}
                        </Badge>
                        {(community.is_featured || community.isFeatured) && (
                          <Badge className="bg-dna-copper text-white text-xs">Featured</Badge>
                        )}
                        {community.is_member && (
                          <Badge className="bg-dna-emerald text-white text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Member
                          </Badge>
                        )}
                      </div>
                    </div>
                    <MobileTouchButton 
                      size="sm"
                      className={`whitespace-nowrap ${
                        community.is_member 
                          ? "bg-dna-forest hover:bg-dna-emerald text-white" 
                          : community.user_membership?.status === 'pending'
                          ? "bg-gray-400 cursor-not-allowed text-white"
                          : "bg-dna-emerald hover:bg-dna-forest text-white"
                      }`}
                      onClick={() => handleJoinCommunity(
                        community.id, 
                        community.is_member,
                        community.user_membership?.status
                      )}
                      disabled={community.user_membership?.status === 'pending'}
                    >
                      {React.createElement(getJoinButtonIcon(community), { className: "w-4 h-4 mr-1" })}
                      {getJoinButtonText(community)}
                    </MobileTouchButton>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                {community.description}
              </p>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span>{(community.member_count || community.memberCount || 0).toLocaleString()} members</span>
                </div>
                
                <MobileTouchButton 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-600 hover:text-gray-900"
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Discussions
                </MobileTouchButton>
              </div>
            </div>
          </MobileOptimizedCard>
        ))}
      </MobileResponsiveGrid>

      {!showAll && displayCommunities.length > 3 && (
        <div className="text-center mt-6 sm:mt-8">
          <MobileTouchButton 
            variant="outline" 
            className="border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white"
            onClick={() => setShowAll(true)}
          >
            View More Communities ({displayCommunities.length - 3} more)
          </MobileTouchButton>
        </div>
      )}
    </div>
  );
};

export default CommunitiesTab;
