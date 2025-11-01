import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  className?: string;
}

export const FlipCard = ({ front, back, className }: FlipCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={cn("flip-card-container", className)}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div className={cn("flip-card", isFlipped && "flipped")}>
        <div className="flip-card-front">
          {front}
        </div>
        <div className="flip-card-back">
          {back}
        </div>
      </div>
      
      <style>{`
        .flip-card-container {
          perspective: 1000px;
          width: 100%;
          height: 100%;
        }
        
        .flip-card {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }
        
        .flip-card.flipped {
          transform: rotateY(180deg);
        }
        
        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        
        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};
