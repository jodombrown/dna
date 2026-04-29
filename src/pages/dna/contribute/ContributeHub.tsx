// STUBBED: Phase 2 teardown. Restore in Phase 3 rebuild.
// The CONTRIBUTE module is being reimagined; the authenticated hub now
// shares the same rebuilding landing as the public /contribute route.

import { RebuildingLanding } from '@/components/shared/RebuildingPlaceholder';

export function ContributeHub() {
  return <RebuildingLanding module="contribute" />;
}

export default ContributeHub;
