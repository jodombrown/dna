import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, PartyPopper, Plus, Sparkles, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CompletionCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  spaceName: string;
  onMarkComplete: () => void;
  onAddMoreTasks: () => void;
  onKeepOpen: () => void;
  isLoading?: boolean;
}

export function CompletionCelebration({
  isOpen,
  onClose,
  spaceName,
  onMarkComplete,
  onAddMoreTasks,
  onKeepOpen,
  isLoading = false,
}: CompletionCelebrationProps) {
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  // Trigger confetti when dialog opens
  useEffect(() => {
    if (isOpen && !hasTriggeredConfetti) {
      setHasTriggeredConfetti(true);

      // Fire confetti from multiple directions
      const duration = 3000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        // Left side
        confetti({
          particleCount,
          startVelocity: 30,
          spread: 60,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#22c55e', '#10b981', '#fbbf24', '#3b82f6', '#8b5cf6'],
        });

        // Right side
        confetti({
          particleCount,
          startVelocity: 30,
          spread: 60,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#22c55e', '#10b981', '#fbbf24', '#3b82f6', '#8b5cf6'],
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen, hasTriggeredConfetti]);

  // Reset confetti trigger when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setHasTriggeredConfetti(false);
    }
  }, [isOpen]);

  const handleMarkComplete = () => {
    onMarkComplete();
    onClose();
  };

  const handleAddMoreTasks = () => {
    onAddMoreTasks();
    onClose();
  };

  const handleKeepOpen = () => {
    onKeepOpen();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Trophy className="h-16 w-16 text-yellow-500" />
              <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <DialogTitle className="text-2xl flex items-center justify-center gap-2">
            <PartyPopper className="h-6 w-6 text-green-500" />
            Congratulations!
            <PartyPopper className="h-6 w-6 text-green-500 scale-x-[-1]" />
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            All tasks in <span className="font-semibold text-foreground">"{spaceName}"</span> are complete!
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 text-center">
          <Badge variant="default" className="bg-green-600 hover:bg-green-600 text-sm px-3 py-1">
            <CheckCircle2 className="h-4 w-4 mr-1" />
            100% Complete
          </Badge>
          <p className="text-sm text-muted-foreground mt-4">
            Would you like to mark this project as complete?
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleMarkComplete}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Mark as Complete
          </Button>
          <Button
            variant="outline"
            onClick={handleAddMoreTasks}
            disabled={isLoading}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add More Tasks
          </Button>
          <Button
            variant="ghost"
            onClick={handleKeepOpen}
            disabled={isLoading}
            className="w-full text-muted-foreground"
          >
            Keep Project Open
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
