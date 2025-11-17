import { ReactNode } from 'react';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';

interface FeedLayoutProps {
  children: ReactNode;
}

export function FeedLayout({ children }: FeedLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20 md:pb-8">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
