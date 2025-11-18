import { ReactNode } from 'react';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';

interface FeedLayoutProps {
  children: ReactNode;
}

export function FeedLayout({ children }: FeedLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-16 sm:pb-20 md:pb-6">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
