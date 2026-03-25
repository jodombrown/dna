/**
 * MediaLightbox - Full-screen image viewer with swipe navigation
 */

import React, { useState, useCallback, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MediaItem } from '@/types/groupMessaging';

interface MediaLightboxProps {
  images: MediaItem[];
  initialIndex: number;
  onClose: () => void;
}

export function MediaLightbox({ images, initialIndex, onClose }: MediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDeltaY, setTouchDeltaY] = useState(0);

  const current = images[currentIndex];

  const goNext = useCallback(() => {
    if (currentIndex < images.length - 1) setCurrentIndex(i => i + 1);
  }, [currentIndex, images.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, goNext, goPrev]);

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setTouchDeltaY(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const deltaY = e.touches[0].clientY - (e.touches[0] as Touch).clientY;
    setTouchDeltaY(deltaY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 60) {
      if (diff > 0) goNext();
      else goPrev();
    }

    // Swipe down to dismiss
    const endY = e.changedTouches[0].clientY;
    const startY = e.changedTouches[0].clientY - touchDeltaY;
    if (endY - startY > 100) onClose();

    setTouchStart(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </Button>
        <span className="text-white/70 text-sm">
          {currentIndex + 1} / {images.length}
        </span>
        <div className="w-9" />
      </div>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center relative min-h-0 px-4">
        {currentIndex > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={goPrev}
            className="absolute left-2 text-white hover:bg-white/20 hidden sm:flex"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}

        <img
          src={current.url}
          alt={current.name}
          className="max-w-full max-h-full object-contain"
        />

        {currentIndex < images.length - 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={goNext}
            className="absolute right-2 text-white hover:bg-white/20 hidden sm:flex"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Bottom info */}
      <div className="flex-shrink-0 px-4 py-3 text-center">
        <p className="text-white/60 text-xs truncate">{current.name}</p>
      </div>
    </div>
  );
}
