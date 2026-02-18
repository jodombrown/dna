import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/useMobile';

interface DetailViewLayoutProps {
  title?: string;
  breadcrumbs?: { label: string; path?: string }[];
  backPath?: string;
  backLabel?: string;
  children: React.ReactNode;
  contextPanel?: React.ReactNode;
  showContextPanel?: boolean;
  className?: string;
}

/**
 * DetailViewLayout - Full-page detail view for FOCUS_DETAIL_MODE
 * 
 * Used for: profiles, events, spaces, stories, needs, offers
 * Provides consistent layout with breadcrumbs, back navigation, and optional context rail
 * 
 * Architecture: Part of ADA v2 (Adaptive Dashboard Architecture)
 */
const DetailViewLayout: React.FC<DetailViewLayoutProps> = ({
  title,
  breadcrumbs = [],
  backPath,
  backLabel = 'Back',
  children,
  contextPanel,
  showContextPanel = true,
  className = '',
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  // On mobile, stack everything vertically
  if (isMobile) {
    return (
      <div className={`flex flex-col min-h-screen bg-background ${className}`}>
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border">
          <div className="p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="mb-2"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {backLabel}
            </Button>
            
            {breadcrumbs.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    {crumb.path ? (
                      <button
                        onClick={() => navigate(crumb.path!)}
                        className="hover:text-foreground transition-colors"
                      >
                        {crumb.label}
                      </button>
                    ) : (
                      <span>{crumb.label}</span>
                    )}
                    {idx < breadcrumbs.length - 1 && <span>/</span>}
                  </React.Fragment>
                ))}
              </div>
            )}
            
            {title && (
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            )}
          </div>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 p-4">
          {children}
        </div>

        {/* Mobile Context Panel (collapsible or below) */}
        {showContextPanel && contextPanel && (
          <div className="border-t border-border p-4 bg-muted/20">
            {contextPanel}
          </div>
        )}
      </div>
    );
  }

  // Desktop: Two-column with independent scrolling
  return (
    <div className={`flex bg-background ${className}`} style={{ height: 'calc(100vh - 64px)' }}>
      {/* Main Content Column */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-4xl mx-auto p-6 overflow-auto h-full focus:outline-none" style={{ minWidth: 0 }}>
        <div className="min-w-max">
          {/* Header / Breadcrumbs */}
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="mb-3"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {backLabel}
            </Button>

            {breadcrumbs.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    {crumb.path ? (
                      <button
                        onClick={() => navigate(crumb.path!)}
                        className="hover:text-foreground transition-colors"
                      >
                        {crumb.label}
                      </button>
                    ) : (
                      <span>{crumb.label}</span>
                    )}
                    {idx < breadcrumbs.length - 1 && <span>/</span>}
                  </React.Fragment>
                ))}
              </div>
            )}

            {title && (
              <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            )}
          </div>

          {/* Main Content */}
          <div className="transition-all duration-300 ease-in-out">
            {children}
          </div>
        </div>
      </main>

      {/* Context Rail (Right Column) - Independent scrolling */}
      {showContextPanel && contextPanel && (
        <div className="w-80 border-l border-border bg-muted/10 p-6 overflow-auto h-full" style={{ minWidth: 0 }}>
          <div className="min-w-max">
            {contextPanel}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailViewLayout;
