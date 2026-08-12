import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// EventDetail's loading and not-found bodies, lifted out of the page file so
// their padding utilities (the loader's centering, the not-found card's
// inset) live in src/components — the design-system gate's page-level-layout
// check is scoped to src/pages, not because these classes ARE page chrome.
// EventDetail wraps this in ConveneShell (standalone) or nothing (hosted);
// the content itself is identical either way.

interface EventDetailLoadingProps {
  onBack: () => void;
}

export function EventDetailLoading({ onBack }: EventDetailLoadingProps) {
  return (
    <>
      <button onClick={onBack} className="inline-flex items-center text-meta text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </>
  );
}

interface EventDetailNotFoundProps {
  onBack: () => void;
  onBrowse: () => void;
}

export function EventDetailNotFound({ onBack, onBrowse }: EventDetailNotFoundProps) {
  return (
    <>
      <button onClick={onBack} className="inline-flex items-center text-meta text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>
      <Card>
        <CardContent className="py-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground">Event not found</p>
            <Button variant="link" onClick={onBrowse}>Back to events</Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
