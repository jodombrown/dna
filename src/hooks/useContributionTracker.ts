
import { useContributions } from './useContributions';
import { useAuth } from '@/contexts/CleanAuthContext';

export const useContributionTracker = () => {
  const { trackContribution } = useContributions();
  const { user } = useAuth();

  const trackPostCreation = (postId: string, postTitle?: string) => {
    if (user) {
      trackContribution('post', postId, postTitle || 'New Post');
    }
  };

  const trackInitiativeCreation = (initiativeId: string, initiativeTitle: string) => {
    if (user) {
      trackContribution('initiative', initiativeId, initiativeTitle);
    }
  };

  const trackEventCreation = (eventId: string, eventTitle: string) => {
    if (user) {
      trackContribution('event', eventId, eventTitle);
    }
  };

  const trackOpportunityCreation = (opportunityId: string, opportunityTitle: string) => {
    if (user) {
      trackContribution('opportunity', opportunityId, opportunityTitle);
    }
  };

  const trackCommunityJoin = (communityId: string, communityName: string) => {
    if (user) {
      trackContribution('community', communityId, communityName);
    }
  };

  const trackNewsletterPublication = (newsletterId: string, newsletterTitle: string) => {
    if (user) {
      trackContribution('newsletter', newsletterId, newsletterTitle);
    }
  };

  return {
    trackPostCreation,
    trackInitiativeCreation,
    trackEventCreation,
    trackOpportunityCreation,
    trackCommunityJoin,
    trackNewsletterPublication
  };
};
