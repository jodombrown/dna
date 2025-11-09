import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SwipeableCardStackProps {
  cards: React.ReactNode[];
  onCardClick?: (index: number) => void;
}

const SwipeableCardStack = ({ cards, onCardClick }: SwipeableCardStackProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(cards.length - 1, prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    
    // Prevent page scroll when swiping horizontally on cards
    if (Math.abs(diff) > 5) {
      e.preventDefault();
    }
    
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // Reduced swipe threshold for mobile: 50px
    if (dragOffset > 50 && currentIndex > 0) {
      handlePrevious();
    } else if (dragOffset < -50 && currentIndex < cards.length - 1) {
      handleNext();
    }
    
    setDragOffset(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const currentX = e.clientX;
    const diff = currentX - startX.current;
    setDragOffset(diff);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    
    if (dragOffset > 80 && currentIndex > 0) {
      handlePrevious();
    } else if (dragOffset < -80 && currentIndex < cards.length - 1) {
      handleNext();
    }
    
    setDragOffset(0);
  };

  const handleCardClick = (e: React.MouseEvent | React.TouchEvent) => {
    // Only trigger click if it wasn't a drag
    if (Math.abs(dragOffset) < 5 && onCardClick) {
      e.stopPropagation();
      onCardClick(currentIndex);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Card Stack Container with Bleeding Edge Effect */}
      <div 
        ref={containerRef}
        className="relative h-[480px] sm:h-[540px] md:h-[580px] perspective-1000 overflow-visible touch-pan-y"
        style={{ touchAction: 'pan-y' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (isDragging) {
            setIsDragging(false);
            setDragOffset(0);
          }
        }}
      >
        {/* Bleeding Edge Indicators - Shows next card peeking */}
        {currentIndex < cards.length - 1 && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 sm:w-12 h-24 sm:h-32 bg-gradient-to-l from-dna-emerald/20 to-transparent rounded-l-2xl z-[9999] pointer-events-none flex items-center justify-start pl-0.5 sm:pl-1">
            <div className="w-0.5 sm:w-1 h-12 sm:h-16 bg-dna-emerald/40 rounded-full animate-pulse" />
          </div>
        )}
        {currentIndex > 0 && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 sm:w-12 h-24 sm:h-32 bg-gradient-to-r from-dna-emerald/20 to-transparent rounded-r-2xl z-[9999] pointer-events-none flex items-center justify-end pr-0.5 sm:pr-1">
            <div className="w-0.5 sm:w-1 h-12 sm:h-16 bg-dna-emerald/40 rounded-full animate-pulse" />
          </div>
        )}
        
        {cards.map((card, index) => {
          const offset = index - currentIndex;
          const isActive = index === currentIndex;
          
          // Calculate transform based on position in stack with better bleeding
          let transform = '';
          let zIndex = cards.length - Math.abs(offset);
          let opacity = 1;
          
          if (offset < 0) {
            // Cards before current (left side, partially visible for bleeding edge)
            transform = `translateX(-90%) scale(0.85)`;
            opacity = 0.4;
            zIndex = 1;
          } else if (offset === 0) {
            // Current active card
            const dragTransform = isDragging ? `translateX(${dragOffset}px)` : '';
            transform = `translateX(0) scale(1) ${dragTransform}`;
            opacity = 1;
          } else if (offset === 1) {
            // Next card (visible bleeding edge on right)
            transform = `translateX(90%) scale(0.85)`;
            opacity = 0.4;
            zIndex = 1;
          } else {
            // Cards further ahead (stacked behind next card)
            const stackOffset = Math.min(offset - 1, 2);
            transform = `translateX(${90 + stackOffset * 10}%) scale(${0.85 - stackOffset * 0.03})`;
            opacity = Math.max(0, 0.3 - stackOffset * 0.15);
            zIndex = 1;
          }

          return (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-300 ease-out cursor-pointer select-none ${
                isActive ? 'pointer-events-auto' : 'pointer-events-none'
              }`}
              style={{
                transform,
                zIndex,
                opacity,
                transformStyle: 'preserve-3d',
              }}
              onClick={handleCardClick}
            >
              {card}
            </div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={`p-3 rounded-full bg-white shadow-lg transition-all ${
            currentIndex === 0 
              ? 'opacity-30 cursor-not-allowed' 
              : 'hover:bg-gray-50 active:scale-95'
          }`}
          aria-label="Previous card"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>

        {/* Indicator Dots */}
        <div className="flex items-center gap-2">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all rounded-full ${
                index === currentIndex
                  ? 'w-8 h-2 bg-dna-emerald'
                  : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          className={`p-3 rounded-full bg-white shadow-lg transition-all ${
            currentIndex === cards.length - 1
              ? 'opacity-30 cursor-not-allowed'
              : 'hover:bg-gray-50 active:scale-95'
          }`}
          aria-label="Next card"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Swipe Hint */}
      <div className="text-center mt-3 sm:mt-4">
        <p className="text-xs sm:text-sm text-gray-500 font-medium px-4">← Swipe to explore →</p>
      </div>
    </div>
  );
};

export default SwipeableCardStack;
