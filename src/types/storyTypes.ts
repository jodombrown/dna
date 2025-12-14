/**
 * DNA | CONVEY - Story Type Definitions
 * 
 * Story Types define the structured templates for different kinds of stories
 * users can create. Each type has specific UI treatment and field suggestions.
 */

export type StoryType = 'impact' | 'update' | 'spotlight' | 'photo_essay';

export interface StoryTypeConfig {
  id: StoryType;
  label: string;
  description: string;
  icon: string;
  placeholders: {
    title: string;
    subtitle: string;
    content: string;
  };
  suggestedLength: {
    min: number;
    max: number;
  };
  supportsGallery: boolean;
}

export const STORY_TYPE_CONFIG: Record<StoryType, StoryTypeConfig> = {
  impact: {
    id: 'impact',
    label: 'Impact Story',
    description: 'Share measurable outcomes, success stories, and real change',
    icon: '✨',
    placeholders: {
      title: 'e.g., "How 50 Students Got Scholarships Through Our Network"',
      subtitle: 'A brief summary of the impact achieved',
      content: 'Share the before/after, the metrics, the testimonials. What changed because of this work?',
    },
    suggestedLength: { min: 500, max: 3000 },
    supportsGallery: true,
  },
  update: {
    id: 'update',
    label: 'Update',
    description: 'Progress reports, milestones, news from your work',
    icon: '📢',
    placeholders: {
      title: 'e.g., "Q4 Progress: Building the Lagos Tech Hub"',
      subtitle: 'What\'s the key takeaway?',
      content: 'What happened? What\'s next? Share your progress and learnings.',
    },
    suggestedLength: { min: 300, max: 2000 },
    supportsGallery: false,
  },
  spotlight: {
    id: 'spotlight',
    label: 'Spotlight',
    description: 'Highlight a person, organization, or initiative making a difference',
    icon: '🔦',
    placeholders: {
      title: 'e.g., "Meet Amara: Connecting Diaspora Engineers to African Startups"',
      subtitle: 'Who are you spotlighting?',
      content: 'Tell their story. What makes them remarkable? How are they contributing?',
    },
    suggestedLength: { min: 400, max: 2500 },
    supportsGallery: true,
  },
  photo_essay: {
    id: 'photo_essay',
    label: 'Photo Essay',
    description: 'Visual storytelling with images that speak',
    icon: '📸',
    placeholders: {
      title: 'e.g., "A Week at the African Diaspora Summit"',
      subtitle: 'What story do your photos tell?',
      content: 'Add captions and context to your photos. Let the images lead.',
    },
    suggestedLength: { min: 200, max: 1500 },
    supportsGallery: true,
  },
};

export function getStoryTypeConfig(type: StoryType): StoryTypeConfig {
  return STORY_TYPE_CONFIG[type];
}

export function getStoryTypeOptions(): Array<{ value: StoryType; label: string; description: string; icon: string }> {
  return Object.values(STORY_TYPE_CONFIG).map((config) => ({
    value: config.id,
    label: config.label,
    description: config.description,
    icon: config.icon,
  }));
}
