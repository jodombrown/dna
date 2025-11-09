import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SwipeableCardStackProps {
  cards: React.ReactNode[];
  onCardClick?: (index: number) => void;
}

const SwipeableCardStack = ({ cards, onCardClick }: SwipeableCardStackProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(cards.length - 1, prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 75;
    const isRightSwipe = distance < -75;
    
    if (isLeftSwipe && currentIndex < cards.length - 1) {
      handleNext();
    }
    if (isRightSwipe && currentIndex > 0) {
      handlePrevious();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(currentIndex);
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Card Carousel Container */}
      <div 
        className="relative overflow-hidden rounded-2xl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ 
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {cards.map((card, index) => (
            <div
              key={index}
              className="min-w-full px-2 sm:px-4"
              onClick={handleCardClick}
            >
              <div className="w-full">
                {card}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mt-6">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={`p-2 sm:p-3 rounded-full bg-white shadow-lg transition-all ${
            currentIndex === 0 
              ? 'opacity-30 cursor-not-allowed' 
              : 'hover:bg-gray-50 active:scale-95'
          }`}
          aria-label="Previous card"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
        </button>

        {/* Indicator Dots */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all rounded-full ${
                index === currentIndex
                  ? 'w-6 sm:w-8 h-2 bg-dna-emerald'
                  : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          className={`p-2 sm:p-3 rounded-full bg-white shadow-lg transition-all ${
            currentIndex === cards.length - 1
              ? 'opacity-30 cursor-not-allowed'
              : 'hover:bg-gray-50 active:scale-95'
          }`}
          aria-label="Next card"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
        </button>
      </div>

      {/* Swipe Hint */}
      <div className="text-center mt-3 sm:mt-4">
        <p className="text-xs sm:text-sm text-muted-foreground font-medium">Swipe or tap arrows to explore</p>
      </div>
    </div>
  );
};

export default SwipeableCardStack;
