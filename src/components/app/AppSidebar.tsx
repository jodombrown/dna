import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Handshake, 
  Heart, 
  MapPin,
  Plus,
  Crown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useVerificationStatus } from '@/hooks/useVerification';
import VerifiedContributorBadge from './VerifiedContributorBadge';
import ContributorVerificationModal from './ContributorVerificationModal';

const AppSidebar = () => {
  const { user } = useAuth();
  const { verificationStatus, loading: verificationLoading } = useVerificationStatus();

  return (
    <div className="space-y-4">
      {/* Profile Snapshot */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Avatar className="h-16 w-16 mx-auto mb-4">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-dna-emerald text-white text-lg">
                {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center justify-center gap-2 mb-2">
              <h3 className="font-semibold text-dna-forest">
                {user?.user_metadata?.full_name || 'DNA Member'}
              </h3>
              <VerifiedContributorBadge 
                isVerified={verificationStatus.is_verified}
                impactType={verificationStatus.impact_type}
                size="sm"
              />
            </div>
            <p className="text-sm text-gray-600 mb-3">Welcome to your dashboard</p>
            <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
              <MapPin className="h-4 w-4 mr-1" />
              Location not set
            </div>
            
            {/* Verification Action */}
            {!verificationStatus.is_verified && !verificationLoading && (
              <div className="mb-3">
                <ContributorVerificationModal>
                  <Button variant="outline" size="sm" className="w-full mb-2 text-dna-gold border-dna-gold hover:bg-dna-gold hover:text-white">
                    <Crown className="h-4 w-4 mr-2" />
                    Request Verification
                  </Button>
                </ContributorVerificationModal>
              </div>
            )}
            
            <Button variant="outline" size="sm" className="w-full">
              Complete Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mission Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">DNA Pillars</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="ghost" className="w-full justify-start text-dna-emerald hover:bg-dna-emerald/10">
            <Users className="h-4 w-4 mr-3" />
            Connect
          </Button>
          <Button variant="ghost" className="w-full justify-start text-dna-copper hover:bg-dna-copper/10">
            <Handshake className="h-4 w-4 mr-3" />
            Collaborate
          </Button>
          <Button variant="ghost" className="w-full justify-start text-dna-forest hover:bg-dna-forest/10">
            <Heart className="h-4 w-4 mr-3" />
            Contribute
          </Button>
        </CardContent>
      </Card>

      {/* My Communities Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Communities
            <Button size="sm" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">
            Join communities to connect with like-minded professionals
          </p>
          <Button variant="outline" size="sm" className="w-full">
            Browse Communities
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppSidebar;