/**
 * DNA Messaging System — UI Layout & Interaction Constants
 *
 * Design specifications for the messaging interface across mobile and desktop.
 * All colors reference the DNA design system.
 */

// ============================================================
// LAYOUT SPECIFICATIONS
// ============================================================

export const MESSAGING_LAYOUT = {
  // Conversation list
  list: {
    mobile: {
      type: 'full_screen' as const,
      headerHeight: 56,
      searchBarHeight: 44,
      filterBarHeight: 40,
    },
    desktop: {
      type: 'left_panel' as const,
      width: 340,
    },
  },

  // Conversation thread
  thread: {
    mobile: {
      type: 'full_screen' as const,
      headerHeight: 64,
      inputBarHeight: 56,
      maxInputHeight: 120,
    },
    desktop: {
      type: 'center_panel' as const,
    },
  },

  // Message bubbles
  bubble: {
    maxWidth: '75%',
    sent: {
      background: '#4A8D77', // DNA Emerald
      textColor: '#FFFFFF',
      borderRadius: '16px 16px 4px 16px',
    },
    received: {
      background: '#F0EFED', // Warm gray
      textColor: '#1A1A1A',
      borderRadius: '16px 16px 16px 4px',
    },
    system: {
      background: 'transparent',
      textColor: '#666666',
      fontSize: 13,
      alignment: 'center' as const,
    },
  },

  // Input bar
  input: {
    backgroundColor: '#F9F7F4',
    borderRadius: 24,
    placeholder: 'Type a message...',
    attachButtonSize: 32,
    sendButtonSize: 36,
    sendButtonColor: '#4A8D77',
    voiceNoteButtonSize: 36,
  },

  // Smart replies (DIA)
  smartReplies: {
    height: 36,
    backgroundColor: '#F9F7F4',
    borderColor: '#4A8D77',
    textColor: '#4A8D77',
    maxCount: 3,
    fontSize: 14,
    borderRadius: 18,
  },

  // Conversation type indicators
  typeIndicators: {
    direct: { icon: 'message', color: '#4A8D77' },
    group: { icon: 'people', color: '#4A8D77' },
    event_thread: { icon: 'calendar', color: '#C4942A' },
    space_channel: { icon: 'grid', color: '#2D5A3D' },
    opportunity_thread: { icon: 'handshake', color: '#B87333' },
  },
} as const;

// ============================================================
// MOBILE INTERACTION PATTERNS
// ============================================================

export const MESSAGING_INTERACTIONS = {
  // Message actions (long press)
  longPressMessage: {
    items: ['Reply', 'React', 'Copy', 'Pin', 'Forward', 'Delete'] as const,
    presentation: 'context_menu' as const,
  },

  // Swipe gestures
  swipeRight: 'reply' as const,
  swipeLeftConversation: 'mute_archive' as const,

  // Voice notes
  voiceNote: {
    holdToRecord: true,
    swipeUpToLock: true,
    maxDuration: 120, // 2 minute max (Pro). Free: 30s. Org: 300s.
    waveformDisplay: true,
  },

  // Media
  imagePicker: {
    maxImages: 5,
    maxFileSize: 25 * 1024 * 1024, // 25MB Pro, 5MB Free
    compressionEnabled: true,
  },

  // Scroll behavior
  scrollToBottom: {
    newMessageBehavior: 'auto_scroll_if_near_bottom' as const,
    threshold: 200, // px from bottom
    showNewMessageBanner: true,
  },
} as const;

// ============================================================
// PERFORMANCE TARGETS
// ============================================================

export const MESSAGING_PERFORMANCE = {
  sendMessage: 100,           // < 100ms to DB
  realTimeDelivery: 500,      // < 500ms
  loadConversationList: 200,  // < 200ms
  loadMessageThread: 300,     // < 300ms
  fullTextSearch: 500,        // < 500ms
  typingIndicator: 100,       // < 100ms
  offlineQueueSync: 5000,     // < 5s for 10 items
} as const;

// ============================================================
// RATE LIMITS
// ============================================================

export const MESSAGING_RATE_LIMITS = {
  messagesPerMinute: 60,
  reactionsPerMinute: 30,
  typingIndicatorThrottleMs: 2000,
} as const;

// ============================================================
// PAGINATION DEFAULTS
// ============================================================

export const MESSAGING_PAGINATION = {
  conversationListPageSize: 20,
  messageThreadPageSize: 30,
  searchResultsPageSize: 20,
  maxParticipantPreview: 5,
} as const;
