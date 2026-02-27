/**
 * DNA | CONVENE — Organizer Insight Generator
 * Pure function that produces a contextual DIA insight for the organizer.
 */

export interface OrganizerInsight {
  message: string;
  ctaLabel: string;
  ctaPath: string;
}

interface InsightInput {
  eventsHosted: number;
  totalAttendees: number;
  upcoming: number;
  /** Most recent event title */
  lastEventTitle?: string;
  /** Attendees at most recent event */
  lastEventAttendees?: number;
  /** Days since last event ended */
  daysSinceLastEvent?: number;
  /** Most common event_type the user hosts */
  topCategory?: string;
}

export function generateOrganizerInsight(input: InsightInput): OrganizerInsight | null {
  // Never hosted
  if (input.eventsHosted === 0) {
    return {
      message: 'Ready to bring the diaspora together? Host your first event and start building your community!',
      ctaLabel: 'Host Your First Event',
      ctaPath: '/dna/convene/events/new',
    };
  }

  // Great turnout on last event
  if (input.lastEventAttendees && input.lastEventAttendees >= 20 && input.lastEventTitle) {
    return {
      message: `Great turnout at "${input.lastEventTitle}"! ${input.lastEventAttendees} people attended. Keep the momentum going.`,
      ctaLabel: 'Host Another Event',
      ctaPath: '/dna/convene/events/new',
    };
  }

  // Inactive for 30+ days
  if (input.daysSinceLastEvent && input.daysSinceLastEvent >= 30) {
    const attendeeMsg = input.lastEventAttendees
      ? ` Your last event had ${input.lastEventAttendees} attendees.`
      : '';
    return {
      message: `It's been ${input.daysSinceLastEvent} days since your last event.${attendeeMsg} Ready for another?`,
      ctaLabel: 'Host an Event',
      ctaPath: '/dna/convene/events/new',
    };
  }

  // Category insight
  if (input.topCategory && input.eventsHosted >= 3) {
    return {
      message: `Your ${input.topCategory} events are popular with the community. Consider hosting more!`,
      ctaLabel: `Host ${input.topCategory} Event`,
      ctaPath: '/dna/convene/events/new',
    };
  }

  // Generic milestone
  if (input.totalAttendees > 0) {
    return {
      message: `You've brought ${input.totalAttendees} people together across ${input.eventsHosted} events. That's real impact!`,
      ctaLabel: 'View Analytics',
      ctaPath: '/dna/convene/analytics',
    };
  }

  return null;
}
