import { ReactNode } from 'react';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';

interface FeedLayoutProps {
  children: ReactNode;
}

export function FeedLayout({ children }: FeedLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-bottom-nav md:pb-bottom-nav-0">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
