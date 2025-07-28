import { useEffect } from 'react';
import { X, Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useUserAchievements } from '@/stores/useUserAchievements';
import { cn } from '@/lib/utils';

export const MilestoneBanner = () => {
  const { showCelebration, currentCelebration, dismissCelebration } = useUserAchievements();

  useEffect(() => {
    if (showCelebration) {
      // Auto-dismiss after 10 seconds
      const timer = setTimeout(() => {
        dismissCelebration();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showCelebration, dismissCelebration]);

  if (!showCelebration || !currentCelebration) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <Card className={cn(
        "relative max-w-md mx-4 p-6 text-center",
        "bg-gradient-to-br from-dna-gold/20 to-dna-copper/20",
        "border-dna-gold animate-scale-in"
      )}>
        <Button
          variant="ghost"
          size="sm"
          onClick={dismissCelebration}
          className="absolute top-2 right-2 h-6 w-6 p-0 text-dna-forest/70 hover:text-dna-forest"
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <Trophy className="h-12 w-12 text-dna-gold animate-pulse" />
            <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-dna-copper animate-bounce" />
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-dna-forest mb-2">
          Milestone Achieved!
        </h2>
        
        <p className="text-dna-forest/80 mb-4">
          {currentCelebration.message}
        </p>
        
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={dismissCelebration}
            className="border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white"
          >
            Continue
          </Button>
        </div>
      </Card>
    </div>
  );
};