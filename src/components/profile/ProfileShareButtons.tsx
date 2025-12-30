import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, MessageSquare, Linkedin, Twitter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/config/routes';

interface ProfileShareButtonsProps {
  username: string;
  fullName: string;
  className?: string;
}

export const ProfileShareButtons: React.FC<ProfileShareButtonsProps> = ({
  username,
  fullName,
  className = ""
}) => {
  const { toast } = useToast();
  // Use the canonical profile URL format for sharing
  const profileUrl = `${window.location.origin}${ROUTES.profile.view(username)}`;
  const shareText = `Check out ${fullName}'s profile on DNA - Diaspora Network of Africa`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast({
        title: "Link Copied!",
        description: "Profile link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const shareViaWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${profileUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;
    window.open(linkedinUrl, '_blank');
  };

  const shareViaTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${fullName}'s Impact Profile`,
          text: shareText,
          url: profileUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback to copy
      copyLink();
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={copyLink}
        className="hover:bg-dna-emerald/10"
      >
        <Copy className="h-4 w-4 mr-2" />
        Copy Link
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={shareViaWhatsApp}
        className="hover:bg-green-50 hover:border-green-200"
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        WhatsApp
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={shareViaLinkedIn}
        className="hover:bg-blue-50 hover:border-blue-200"
      >
        <Linkedin className="h-4 w-4 mr-2" />
        LinkedIn
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={shareViaTwitter}
        className="hover:bg-sky-50 hover:border-sky-200"
      >
        <Twitter className="h-4 w-4 mr-2" />
        Twitter
      </Button>
      
      {navigator.share && (
        <Button
          variant="outline"
          size="sm"
          onClick={nativeShare}
          className="hover:bg-dna-forest/10"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      )}
    </div>
  );
};