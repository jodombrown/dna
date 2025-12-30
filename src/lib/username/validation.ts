import { supabase } from '@/integrations/supabase/client';

export const USERNAME_RULES = {
  minLength: 3,
  maxLength: 20,
  pattern: /^[a-z0-9_-]+$/,
  reservedWords: [
    'admin', 'support', 'dna', 'api', 'www', 'app', 'help', 'about', 
    'contact', 'settings', 'profile', 'user', 'users', 'account', 'dashboard',
    'login', 'logout', 'signup', 'register', 'connect', 'collaborate', 'contribute',
    'convene', 'events', 'messages', 'network', 'discover', 'impact', 'system'
  ],
  maxLifetimeChanges: 3,
};

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export async function validateUsername(
  username: string, 
  currentUserId?: string
): Promise<ValidationResult> {
  // Check length
  if (username.length < USERNAME_RULES.minLength) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }
  
  if (username.length > USERNAME_RULES.maxLength) {
    return { valid: false, error: 'Username cannot exceed 20 characters' };
  }
  
  // Check format (lowercase, numbers, underscore, hyphen only)
  if (!USERNAME_RULES.pattern.test(username)) {
    return { 
      valid: false, 
      error: 'Username can only contain lowercase letters, numbers, underscores, and hyphens' 
    };
  }
  
  // Check reserved words
  if (USERNAME_RULES.reservedWords.includes(username.toLowerCase())) {
    return { valid: false, error: 'This username is reserved' };
  }
  
  // Check uniqueness (case-insensitive)
  const { data, error } = await supabase.rpc('check_username_available', {
    p_username: username,
    p_user_id: currentUserId || null
  });

  if (error) {
    return { valid: false, error: 'Error checking username availability' };
  }
  
  if (!data) {
    return { valid: false, error: 'Username already taken' };
  }
  
  return { valid: true };
}

export function getActivityStatus(lastSeen: Date | string | null) {
  if (!lastSeen) {
    return { status: 'inactive', label: null, color: 'gray' as const };
  }
  
  const lastSeenDate = typeof lastSeen === 'string' ? new Date(lastSeen) : lastSeen;
  const hoursAgo = (Date.now() - lastSeenDate.getTime()) / (1000 * 60 * 60);
  
  if (hoursAgo < 1) return { status: 'online', label: 'Active now', color: 'green' as const };
  if (hoursAgo < 24) return { status: 'recent', label: `Active ${Math.round(hoursAgo)}h ago`, color: 'green' as const };
  if (hoursAgo < 168) return { status: 'week', label: 'Active this week', color: 'yellow' as const };
  return { status: 'inactive', label: null, color: 'gray' as const };
}
