/**
 * DNA Platform Button Variant Guidelines
 * 
 * All buttons should use shadcn/ui Button component with these variants.
 * DO NOT create custom button styles outside this system.
 * 
 * @example
 * import { Button } from '@/components/ui/button';
 * <Button variant="primary">Submit</Button>
 */

export const BUTTON_GUIDELINES = {
  /**
   * PRIMARY - Main call-to-action buttons
   * Usage: Form submissions, primary actions, "Get Started", "Register"
   * Characteristics: DNA Emerald background, high contrast, prominent
   */
  primary: {
    variant: 'default',
    description: 'Main CTAs - form submissions, primary actions',
  },
  
  /**
   * SECONDARY - Supporting actions
   * Usage: Cancel buttons, alternative paths, "Learn More"
   * Characteristics: Subtle gray background, lower visual weight
   */
  secondary: {
    variant: 'secondary',
    description: 'Supporting actions - cancel, alternative paths',
  },
  
  /**
   * OUTLINE - Subtle but important actions
   * Usage: "Connect", "View Profile", secondary CTAs
   * Characteristics: Border with transparent background, converts to solid on hover
   */
  outline: {
    variant: 'outline',
    description: 'Subtle actions - connect, view, explore',
  },
  
  /**
   * GHOST - Tertiary low-emphasis actions
   * Usage: Icon buttons, menu items, low-priority actions
   * Characteristics: No background until hover, minimal visual weight
   */
  ghost: {
    variant: 'ghost',
    description: 'Tertiary actions - icon buttons, menu items',
  },
  
  /**
   * DESTRUCTIVE - Dangerous or irreversible actions
   * Usage: Delete, remove, leave, cancel subscription
   * Characteristics: Red background, clear warning signal
   */
  destructive: {
    variant: 'destructive',
    description: 'Dangerous actions - delete, remove, cancel',
  },
  
  /**
   * LINK - Text-only styled like links
   * Usage: In-text navigation, "Read more", tertiary navigation
   * Characteristics: Underline on hover, no background
   */
  link: {
    variant: 'link',
    description: 'Text links - read more, navigate, explore',
  },
} as const;

/**
 * Button Size Guidelines:
 * - default: Standard 44px touch target (use most often)
 * - sm: Small buttons (36px - use sparingly, ensure touch accessibility)
 * - lg: Large buttons (56px - hero CTAs, mobile primary actions)
 * - icon: Icon-only buttons (40x40px - ensure aria-label present)
 */

/**
 * Loading State Pattern:
 * ```tsx
 * <Button disabled={isLoading}>
 *   {isLoading ? (
 *     <>
 *       <LoadingSpinner size="sm" />
 *       <span className="ml-2">Processing...</span>
 *     </>
 *   ) : (
 *     'Submit'
 *   )}
 * </Button>
 * ```
 */
