/**
 * MessageMediaGrid - Responsive grid layout for media in message bubbles
 * 
 * Layouts: 1 image full-width, 2 side-by-side, 3 one+two, 4+ as 2x2 grid.
 * All images tappable to open lightbox.
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { MediaLightbox } from './MediaLightbox';
import type { MediaItem } from '@/types/groupMessaging';

interface MessageMediaGridProps {
  media: MediaItem[];
  isOwn: boolean;
}

export function MessageMediaGrid({ media, isOwn }: MessageMediaGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const images = media.filter(m => m.type === 'image');
  if (images.length === 0) return null;

  const openLightbox = (index: number) => setLightboxIndex(index);

  return (
    <>
      <div className={cn(
        'mt-1 rounded-lg overflow-hidden',
        images.length === 1 && 'max-w-[280px]',
        images.length === 2 && 'grid grid-cols-2 gap-0.5 max-w-[280px]',
        images.length === 3 && 'grid grid-cols-2 gap-0.5 max-w-[280px]',
        images.length >= 4 && 'grid grid-cols-2 gap-0.5 max-w-[280px]',
      )}>
        {images.length === 1 && (
          <button onClick={() => openLightbox(0)} className="block w-full">
            <img
              src={images[0].url}
              alt={images[0].name}
              className="w-full max-h-[240px] object-cover rounded-lg"
              loading="lazy"
            />
          </button>
        )}

        {images.length === 2 && images.map((img, i) => (
          <button key={i} onClick={() => openLightbox(i)} className="block">
            <img
              src={img.url}
              alt={img.name}
              className="w-full h-[120px] object-cover"
              loading="lazy"
            />
          </button>
        ))}

        {images.length === 3 && (
          <>
            <button onClick={() => openLightbox(0)} className="col-span-2 block">
              <img
                src={images[0].url}
                alt={images[0].name}
                className="w-full h-[160px] object-cover"
                loading="lazy"
              />
            </button>
            {images.slice(1).map((img, i) => (
              <button key={i + 1} onClick={() => openLightbox(i + 1)} className="block">
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-[100px] object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </>
        )}

        {images.length >= 4 && images.slice(0, 4).map((img, i) => (
          <button key={i} onClick={() => openLightbox(i)} className="block relative">
            <img
              src={img.url}
              alt={img.name}
              className="w-full h-[100px] object-cover"
              loading="lazy"
            />
            {i === 3 && images.length > 4 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">+{images.length - 4}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <MediaLightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
