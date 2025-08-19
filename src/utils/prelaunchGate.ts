/**
 * Prelaunch Gate Utilities
 * Controls access during the prelaunch period until September 1, 2025 at 9:00 AM PT
 */

export const LAUNCH_MESSAGES = {
  SIGNUP_NOTICE: "Early users will be able to test the platform starting **September 1, 2025 at 9:00 AM PT**. Sign-ups are not open yet.",
  SIGNIN_BLOCKED: "Public sign-in opens **September 1, 2025 at 9:00 AM PT**.",
  ADMIN_LOGIN_SUBTITLE: "Admin access only. Use your @diasporanetwork.africa email."
} as const;

export const isPrelaunchLocked = (): boolean => {
  const flag = import.meta.env.VITE_PRELAUNCH_LOCKED;
  const launchIso = import.meta.env.VITE_LAUNCH_TIME_ISO;
  
  // If no flag is set, allow access
  if (!flag) return false;
  
  // Check if flag is explicitly set to true
  const isLocked = String(flag).toLowerCase() === 'true';
  
  // If not locked by flag, allow access
  if (!isLocked) return false;
  
  // If no launch time is set, default to locked
  if (!launchIso) return true;
  
  try {
    const now = new Date();
    const launch = new Date(launchIso);
    return now < launch;
  } catch (error) {
    console.warn('Invalid launch time format, defaulting to locked:', error);
    return true;
  }
};

export const isAdminEmail = (email: string): boolean => {
  if (!email) return false;
  
  const adminDomain = import.meta.env.VITE_ADMIN_DOMAIN || 'diasporanetwork.africa';
  const adminEmails = import.meta.env.VITE_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  
  const normalizedEmail = email.toLowerCase().trim();
  
  // Check if email is in the admin emails list
  if (adminEmails.includes(normalizedEmail)) return true;
  
  // Check if email is from admin domain
  return normalizedEmail.endsWith(`@${adminDomain}`);
};

export const getLaunchTimeFormatted = (): string => {
  try {
    const launchIso = import.meta.env.VITE_LAUNCH_TIME_ISO;
    if (!launchIso) return 'September 1, 2025 at 9:00 AM PT';
    
    const launch = new Date(launchIso);
    return launch.toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  } catch (error) {
    return 'September 1, 2025 at 9:00 AM PT';
  }
};