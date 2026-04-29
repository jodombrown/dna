// STUBBED: Phase 2 teardown. Restore in Phase 3 rebuild.
// Hub now renders RebuildingLanding directly; this orphaned discovery view
// is replaced with a placeholder so any stray imports do not pull in the
// deleted CONTRIBUTE component dependencies.
import { RebuildingLanding } from '@/components/shared/RebuildingPlaceholder';

export function ContributeDiscovery() {
  return <RebuildingLanding module="contribute" />;
}

export default ContributeDiscovery;
