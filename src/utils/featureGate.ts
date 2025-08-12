import type { FeatureKey } from '@/config/profileGates';
import { FEATURE_GATES } from '@/config/profileGates';

export function missingFieldsForFeature(profile: any, feature: FeatureKey): string[] {
  const req = FEATURE_GATES[feature] ?? [];
  return req.filter((f) => {
    const val = (profile as any)?.[f];
    if (val == null) return true;
    if (Array.isArray(val)) return val.length === 0;
    return !String(val).trim().length;
  });
}
