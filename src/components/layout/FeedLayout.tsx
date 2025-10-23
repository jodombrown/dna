import { ReactNode } from 'react';
import UnifiedHeader from '@/components/UnifiedHeader';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';

interface FeedLayoutProps {
  children: ReactNode;
}

export function FeedLayout({ children }: FeedLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      <main className="pt-16 pb-20 md:pb-8">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
