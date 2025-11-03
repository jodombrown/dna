/**
 * Rate limiting system to prevent spam and abuse
 * Stores rate limit data in memory (resets on server restart)
 * For production, consider Redis or similar persistent store
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const rateLimits = new Map<string, number[]>();

const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // Posts
  'create_post': { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
  'create_group_post': { maxRequests: 20, windowMs: 60 * 60 * 1000 }, // 20 per hour
  
  // Comments
  'create_comment': { maxRequests: 30, windowMs: 60 * 60 * 1000 }, // 30 per hour
  
  // Connections
  'send_connection_request': { maxRequests: 50, windowMs: 24 * 60 * 60 * 1000 }, // 50 per day
  
  // Messages
  'send_message': { maxRequests: 100, windowMs: 60 * 60 * 1000 }, // 100 per hour
  
  // Groups
  'create_group': { maxRequests: 5, windowMs: 24 * 60 * 60 * 1000 }, // 5 per day
  'join_group': { maxRequests: 20, windowMs: 60 * 60 * 1000 }, // 20 per hour
  
  // Events
  'create_event': { maxRequests: 10, windowMs: 24 * 60 * 60 * 1000 }, // 10 per day
  'rsvp_event': { maxRequests: 50, windowMs: 60 * 60 * 1000 }, // 50 per hour
  
  // Likes
  'like_post': { maxRequests: 100, windowMs: 60 * 60 * 1000 }, // 100 per hour
};

export function checkRateLimit(userId: string, action: keyof typeof RATE_LIMIT_CONFIGS): {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
} {
  const config = RATE_LIMIT_CONFIGS[action];
  if (!config) {
    console.warn(`No rate limit config for action: ${action}`);
    return { allowed: true, remaining: 999, resetAt: new Date(Date.now() + 3600000) };
  }

  const key = `${userId}:${action}`;
  const now = Date.now();
  const timestamps = rateLimits.get(key) || [];
  
  // Remove expired timestamps
  const recentTimestamps = timestamps.filter(t => now - t < config.windowMs);
  
  const allowed = recentTimestamps.length < config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - recentTimestamps.length);
  const oldestTimestamp = recentTimestamps[0] || now;
  const resetAt = new Date(oldestTimestamp + config.windowMs);
  
  if (allowed) {
    recentTimestamps.push(now);
    rateLimits.set(key, recentTimestamps);
  }
  
  return { allowed, remaining, resetAt };
}

export function getRateLimitStatus(userId: string, action: keyof typeof RATE_LIMIT_CONFIGS): {
  remaining: number;
  total: number;
  resetAt: Date;
} {
  const config = RATE_LIMIT_CONFIGS[action];
  if (!config) {
    return { remaining: 999, total: 999, resetAt: new Date(Date.now() + 3600000) };
  }

  const key = `${userId}:${action}`;
  const now = Date.now();
  const timestamps = rateLimits.get(key) || [];
  
  const recentTimestamps = timestamps.filter(t => now - t < config.windowMs);
  const remaining = Math.max(0, config.maxRequests - recentTimestamps.length);
  const oldestTimestamp = recentTimestamps[0] || now;
  const resetAt = new Date(oldestTimestamp + config.windowMs);
  
  return {
    remaining,
    total: config.maxRequests,
    resetAt,
  };
}

// Cleanup old entries every hour
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of rateLimits.entries()) {
      const action = key.split(':')[1] as keyof typeof RATE_LIMIT_CONFIGS;
      const config = RATE_LIMIT_CONFIGS[action];
      if (config) {
        const recentTimestamps = timestamps.filter(t => now - t < config.windowMs);
        if (recentTimestamps.length === 0) {
          rateLimits.delete(key);
        } else {
          rateLimits.set(key, recentTimestamps);
        }
      }
    }
  }, 60 * 60 * 1000); // Every hour
}
