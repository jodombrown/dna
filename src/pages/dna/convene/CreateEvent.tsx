import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUniversalComposer } from '@/hooks/useUniversalComposer';
import { UniversalComposer } from '@/components/composer/UniversalComposer';
import LayoutController from '@/components/LayoutController';
import { LeftNav } from '@/components/layout/columns/LeftNav';
import { RightWidgets } from '@/components/layout/columns/RightWidgets';

/**
 * CreateEvent - Redirect to Universal Composer
 * 
 * This page now redirects to open the Universal Composer in Event mode.
 * All event creation should go through the unified composer.
 */
const CreateEvent = () => {
  const navigate = useNavigate();
  const composer = useUniversalComposer();

  useEffect(() => {
    // Open composer in event mode immediately
    composer.open('event');
  }, []);

  // Handle close - navigate back to convene hub
  const handleClose = () => {
    composer.close();
    navigate('/dna/convene');
  };

  return (
    <LayoutController
      leftColumn={<LeftNav />}
      centerColumn={
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Opening event composer...</p>
        </div>
      }
      rightColumn={<RightWidgets variant="convene" />}
    >
      <UniversalComposer
        isOpen={composer.isOpen}
        mode={composer.mode}
        context={composer.context}
        isSubmitting={composer.isSubmitting}
        onClose={handleClose}
        onModeChange={composer.switchMode}
        successData={composer.successData}
        onSubmit={composer.submit}
        onDismissSuccess={composer.dismissSuccess}
      />
    </LayoutController>
  );
};

export default CreateEvent;
