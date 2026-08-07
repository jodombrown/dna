import { useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { PageFrame } from '@/components/layout/PageFrame';
import { Construction } from 'lucide-react';

/**
 * Fallback for admin sidebar links that don't have a page built yet
 * (AdminDashboardLayout.tsx's nav lists a handful of roadmap items —
 * e.g. Pending Approval, Segments, Platform Settings — with no matching
 * route). Without this, those links fell through to the global 404
 * outside the admin shell entirely. Registered as the catch-all child of
 * /admin in App.tsx.
 */
export default function AdminComingSoon() {
  const location = useLocation();

  return (
    <PageFrame centered>
      <Card>
        <CardContent className="flex flex-col items-center gap-3 pt-16 pb-16 text-center">
          <Construction className="h-8 w-8 text-muted-foreground" />
          <h1 className="text-h1 font-semibold">Coming soon</h1>
          <p className="text-body text-muted-foreground">
            This admin page ({location.pathname}) hasn't been built yet.
          </p>
        </CardContent>
      </Card>
    </PageFrame>
  );
}
