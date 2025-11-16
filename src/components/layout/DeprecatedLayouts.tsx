/**
 * ⚠️ DEPRECATED LAYOUTS - DO NOT USE IN NEW CODE ⚠️
 * 
 * These layout components are deprecated as of the ADA refactoring.
 * All /dna/* routes should now use LayoutController with ViewStateContext.
 * 
 * Migration Path:
 * - FeedLayout → LayoutController with leftColumn, centerColumn, rightColumn
 * - UserDashboardLayout → LayoutController with appropriate columns
 * - LinkedInLayout → LayoutController with custom column configuration
 * 
 * Timeline: These will be removed in the next major version.
 * 
 * @deprecated Use LayoutController from @/components/LayoutController instead
 */

import React from 'react';

/**
 * @deprecated Use LayoutController instead
 */
export const FeedLayout = ({ children }: { children: React.ReactNode }) => {
  console.warn('FeedLayout is deprecated. Use LayoutController instead.');
  return <div className="deprecated-feed-layout">{children}</div>;
};

/**
 * @deprecated Use LayoutController instead
 */
export const UserDashboardLayout = () => {
  console.warn('UserDashboardLayout is deprecated. Use LayoutController instead.');
  return <div className="deprecated-user-dashboard-layout">Deprecated</div>;
};

/**
 * @deprecated Use LayoutController instead
 */
export const LinkedInLayout = ({ children }: { children: React.ReactNode }) => {
  console.warn('LinkedInLayout is deprecated. Use LayoutController instead.');
  return <div className="deprecated-linkedin-layout">{children}</div>;
};
