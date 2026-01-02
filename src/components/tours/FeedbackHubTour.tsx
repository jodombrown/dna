import React from 'react';
import {
  MessageSquare,
  Tag,
  Filter,
  Heart,
  Mic,
  Pin,
} from 'lucide-react';
import { FeatureTour, type TourStep } from './FeatureTour';
import { FEATURE_TOUR_IDS } from '@/hooks/useFeatureTour';

/**
 * Feedback Hub Tour Steps
 *
 * These steps guide users through the key features of the Feedback Hub:
 * 1. Welcome - Purpose and value
 * 2. Tagging - Using #Bug, #Suggestion, #Question, #Praise, #Other
 * 3. Filtering - All, My Feedback, Pinned tabs
 * 4. Reactions & Replies - Engaging with feedback
 * 5. Rich Media - Voice notes, video, attachments
 * 6. Getting Noticed - How admins respond
 */
const FEEDBACK_HUB_TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Feedback Hub',
    description: 'Your direct line to the DNA team. Help us build something amazing together.',
    icon: MessageSquare,
    content: (
      <div className="space-y-2 text-sm">
        <p>The Feedback Hub is where you can:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><b>Report bugs</b> you encounter while using DNA</li>
          <li><b>Suggest features</b> you'd love to see</li>
          <li><b>Ask questions</b> about how things work</li>
          <li><b>Share praise</b> for what's working well</li>
        </ul>
        <p className="text-muted-foreground mt-3">
          Every piece of feedback helps shape DNA's future!
        </p>
      </div>
    ),
  },
  {
    id: 'tagging',
    title: 'Tag Your Feedback',
    description: 'Use tags to categorize your feedback so it gets to the right people.',
    icon: Tag,
    content: (
      <div className="space-y-3 text-sm">
        <p>Available tags:</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 rounded-md bg-red-50 dark:bg-red-950/30">
            <span className="text-red-500 font-medium">#Bug</span>
            <span className="text-xs text-muted-foreground">Something broken</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-md bg-amber-50 dark:bg-amber-950/30">
            <span className="text-amber-500 font-medium">#Suggestion</span>
            <span className="text-xs text-muted-foreground">New ideas</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-md bg-blue-50 dark:bg-blue-950/30">
            <span className="text-blue-500 font-medium">#Question</span>
            <span className="text-xs text-muted-foreground">Need help</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-md bg-green-50 dark:bg-green-950/30">
            <span className="text-green-500 font-medium">#Praise</span>
            <span className="text-xs text-muted-foreground">What you love</span>
          </div>
        </div>
        <p className="text-muted-foreground">
          Click on a tag button below the composer to add it to your message.
        </p>
      </div>
    ),
  },
  {
    id: 'filtering',
    title: 'Filter Messages',
    description: 'Use the tabs to find what you\'re looking for quickly.',
    icon: Filter,
    content: (
      <div className="space-y-3 text-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
            <span className="font-semibold">All</span>
            <span className="text-muted-foreground">- See all community feedback</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
            <span className="font-semibold">My Feedback</span>
            <span className="text-muted-foreground">- Your submitted feedback</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
            <span className="font-semibold">Pinned</span>
            <span className="text-muted-foreground">- Important announcements</span>
          </div>
        </div>
        <p className="text-muted-foreground">
          Check the Pinned tab for updates from the DNA team!
        </p>
      </div>
    ),
  },
  {
    id: 'engagement',
    title: 'React & Reply',
    description: 'Engage with feedback from other community members.',
    icon: Heart,
    content: (
      <div className="space-y-3 text-sm">
        <p>Ways to engage:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>
            <b>React</b> with emoji to show support (👍 ❤️ 🎉 👏 💡)
          </li>
          <li>
            <b>Reply</b> to add your thoughts or provide more context
          </li>
          <li>
            <b>Upvote</b> suggestions you want to see implemented
          </li>
        </ul>
        <p className="text-muted-foreground mt-2">
          High-engagement feedback gets prioritized by our team!
        </p>
      </div>
    ),
  },
  {
    id: 'media',
    title: 'Rich Media Support',
    description: 'Use voice notes, video, and attachments to share context.',
    icon: Mic,
    content: (
      <div className="space-y-3 text-sm">
        <p>Enhance your feedback with:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>
            <b>Voice notes</b> - Record audio to explain in detail
          </li>
          <li>
            <b>Video recordings</b> - Show exactly what you're experiencing
          </li>
          <li>
            <b>Screenshots</b> - Attach images for visual context
          </li>
          <li>
            <b>Files</b> - Share relevant documents
          </li>
        </ul>
        <p className="text-muted-foreground mt-2">
          Use the + button next to the composer to add media.
        </p>
      </div>
    ),
  },
  {
    id: 'getting-noticed',
    title: 'How We Respond',
    description: 'Learn how the DNA team handles your feedback.',
    icon: Pin,
    content: (
      <div className="space-y-3 text-sm">
        <p>What happens to your feedback:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>
            <b>Status updates</b> - Admins mark feedback as Open, In Progress, or Resolved
          </li>
          <li>
            <b>Pinned messages</b> - Important updates get pinned for visibility
          </li>
          <li>
            <b>Direct replies</b> - Team members respond with questions or updates
          </li>
        </ul>
        <p className="text-muted-foreground mt-3">
          Thank you for helping us build DNA together! 🙏
        </p>
      </div>
    ),
  },
];

interface FeedbackHubTourProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Feedback Hub Feature Tour
 *
 * A guided tour of the Feedback Hub's key features.
 *
 * Usage:
 * ```tsx
 * const [showTour, setShowTour] = useState(false);
 *
 * <FeedbackHubTour
 *   open={showTour}
 *   onClose={() => setShowTour(false)}
 * />
 * ```
 */
export function FeedbackHubTour({ open, onClose }: FeedbackHubTourProps) {
  return (
    <FeatureTour
      featureId={FEATURE_TOUR_IDS.FEEDBACK_HUB}
      steps={FEEDBACK_HUB_TOUR_STEPS}
      open={open}
      onClose={onClose}
      allowSkip={true}
      completionText="Start Sharing"
    />
  );
}

export default FeedbackHubTour;
