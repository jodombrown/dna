// STUBBED: Phase 2 teardown. Restore in Phase 3 rebuild.
// The COLLABORATE module is being reimagined; the authenticated hub now
// shares the same rebuilding landing as the public /collaborate route.

import { RebuildingLanding } from '@/components/shared/RebuildingPlaceholder';

export default function CollaborateHub() {
  return <RebuildingLanding module="collaborate" />;
}
