import LayoutController from '@/components/LayoutController';
import { LeftNav } from '@/components/layout/columns/LeftNav';
import { RightWidgets } from '@/components/layout/columns/RightWidgets';
import { SpaceDirectory } from '@/components/collaborate/SpaceDirectory';

export default function SpacesIndex() {
  return (
    <LayoutController
      leftColumn={<LeftNav />}
      centerColumn={<SpaceDirectory />}
      rightColumn={<RightWidgets />}
    />
  );
}
