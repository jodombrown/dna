/**
 * Alpha Testing Feature Flags
 *
 * Controls alpha-specific features throughout the platform.
 * Toggle these flags to enable/disable alpha testing infrastructure.
 */

interface FeatureFlags {
  /** Shows alpha banner, feedback widget, test guide */
  isAlphaTest: boolean;
  /** Subtle "ALPHA" watermark in bottom-right corner */
  showAlphaWatermark: boolean;
  /** Floating feedback button on every page */
  enableFeedbackWidget: boolean;
  /** In-app test guide accessible from banner and navigation */
  enableTestGuide: boolean;
  /** Show DIA card reasoning metadata (for debugging only) */
  showDIADebugInfo: boolean;
}

export const FEATURE_FLAGS: FeatureFlags = {
  isAlphaTest: true,
  showAlphaWatermark: true,
  enableFeedbackWidget: true,
  enableTestGuide: true,
  showDIADebugInfo: false,
};
