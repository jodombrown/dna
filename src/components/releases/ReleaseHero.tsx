/**
 * ReleaseHero Component
 * Visual generator for release hero sections
 * Supports gradient, image, video, animation, map, chat, network, notification types
 */

import React from 'react';
import { cn } from '@/lib/utils';
import {
  MapPin,
  MessageCircle,
  Network,
  Bell,
  Sparkles,
  Users,
  Calendar,
  HandHeart,
  Megaphone,
  Layers,
} from 'lucide-react';
import type { ReleaseHeroProps, ReleaseCategory } from '@/types/releases';

// Category-specific gradient colors
const CATEGORY_GRADIENTS: Record<ReleaseCategory, string> = {
  CONNECT: 'from-blue-500 via-blue-400 to-sky-300',
  CONVENE: 'from-purple-500 via-purple-400 to-violet-300',
  COLLABORATE: 'from-emerald-500 via-green-400 to-teal-300',
  CONTRIBUTE: 'from-amber-500 via-yellow-400 to-orange-300',
  CONVEY: 'from-pink-500 via-rose-400 to-red-300',
  PLATFORM: 'from-slate-600 via-gray-500 to-zinc-400',
};

// Category icons for visual overlay
const CATEGORY_ICONS: Record<ReleaseCategory, React.ReactNode> = {
  CONNECT: <Users className="w-full h-full" />,
  CONVENE: <Calendar className="w-full h-full" />,
  COLLABORATE: <Layers className="w-full h-full" />,
  CONTRIBUTE: <HandHeart className="w-full h-full" />,
  CONVEY: <Megaphone className="w-full h-full" />,
  PLATFORM: <Sparkles className="w-full h-full" />,
};

// Hero type specific icons
const HERO_TYPE_ICONS: Record<string, React.ReactNode> = {
  map: <MapPin className="w-full h-full" />,
  chat: <MessageCircle className="w-full h-full" />,
  network: <Network className="w-full h-full" />,
  notification: <Bell className="w-full h-full" />,
};

export const ReleaseHero: React.FC<ReleaseHeroProps> = ({
  heroType,
  imageUrl,
  videoUrl,
  category,
  title,
  className,
}) => {
  // Image hero
  if (heroType === 'image' && imageUrl) {
    return (
      <div className={cn('relative w-full h-full overflow-hidden', className)}>
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Subtle gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
    );
  }

  // Video hero
  if (heroType === 'video' && videoUrl) {
    return (
      <div className={cn('relative w-full h-full overflow-hidden', className)}>
        <video
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
    );
  }

  // Animation hero (Lottie-style placeholder with CSS animation)
  if (heroType === 'animation') {
    return (
      <div
        className={cn(
          'relative w-full h-full overflow-hidden',
          'bg-gradient-to-br',
          CATEGORY_GRADIENTS[category],
          className
        )}
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.3)_0%,transparent_50%)] animate-pulse" />
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.2)_0%,transparent_40%)] animate-pulse"
            style={{ animationDelay: '1s' }}
          />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/40 rounded-full animate-float"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: '3s',
              }}
            />
          ))}
        </div>

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 text-white/60 animate-pulse">
            {CATEGORY_ICONS[category]}
          </div>
        </div>
      </div>
    );
  }

  // Map hero
  if (heroType === 'map') {
    return (
      <div
        className={cn(
          'relative w-full h-full overflow-hidden',
          'bg-gradient-to-br from-emerald-600 to-teal-500',
          className
        )}
      >
        {/* Map grid pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Location pins */}
        <div className="absolute inset-0">
          {[
            { x: '30%', y: '40%' },
            { x: '60%', y: '30%' },
            { x: '45%', y: '60%' },
            { x: '70%', y: '55%' },
          ].map((pos, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: pos.x,
                top: pos.y,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '2s',
              }}
            >
              <MapPin className="w-6 h-6 text-white drop-shadow-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Chat hero
  if (heroType === 'chat') {
    return (
      <div
        className={cn(
          'relative w-full h-full overflow-hidden',
          'bg-gradient-to-br from-blue-600 to-indigo-500',
          className
        )}
      >
        {/* Chat bubbles */}
        <div className="absolute inset-0 flex flex-col items-start justify-center gap-2 p-6">
          <div className="bg-white/90 rounded-2xl rounded-tl-sm px-4 py-2 shadow-lg animate-slideInLeft">
            <div className="w-20 h-2 bg-gray-200 rounded" />
          </div>
          <div
            className="bg-white/90 rounded-2xl rounded-tl-sm px-4 py-2 shadow-lg animate-slideInLeft ml-4"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="w-32 h-2 bg-gray-200 rounded" />
          </div>
          <div
            className="bg-blue-400/90 rounded-2xl rounded-tr-sm px-4 py-2 shadow-lg animate-slideInRight self-end"
            style={{ animationDelay: '0.6s' }}
          >
            <div className="w-24 h-2 bg-white/50 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Network hero
  if (heroType === 'network') {
    return (
      <div
        className={cn(
          'relative w-full h-full overflow-hidden',
          'bg-gradient-to-br from-violet-600 to-purple-500',
          className
        )}
      >
        {/* Network nodes and connections */}
        <svg className="absolute inset-0 w-full h-full opacity-60">
          {/* Connection lines */}
          <line
            x1="20%"
            y1="30%"
            x2="50%"
            y2="50%"
            stroke="white"
            strokeWidth="2"
            className="animate-pulse"
          />
          <line
            x1="50%"
            y1="50%"
            x2="80%"
            y2="35%"
            stroke="white"
            strokeWidth="2"
            className="animate-pulse"
            style={{ animationDelay: '0.5s' }}
          />
          <line
            x1="50%"
            y1="50%"
            x2="70%"
            y2="70%"
            stroke="white"
            strokeWidth="2"
            className="animate-pulse"
            style={{ animationDelay: '1s' }}
          />
          <line
            x1="30%"
            y1="65%"
            x2="50%"
            y2="50%"
            stroke="white"
            strokeWidth="2"
            className="animate-pulse"
            style={{ animationDelay: '1.5s' }}
          />

          {/* Nodes */}
          {[
            { cx: '20%', cy: '30%' },
            { cx: '50%', cy: '50%' },
            { cx: '80%', cy: '35%' },
            { cx: '70%', cy: '70%' },
            { cx: '30%', cy: '65%' },
          ].map((node, i) => (
            <circle
              key={i}
              cx={node.cx}
              cy={node.cy}
              r="12"
              fill="white"
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </svg>
      </div>
    );
  }

  // Notification hero
  if (heroType === 'notification') {
    return (
      <div
        className={cn(
          'relative w-full h-full overflow-hidden',
          'bg-gradient-to-br from-orange-500 to-red-500',
          className
        )}
      >
        {/* Notification cards */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-white/90 rounded-lg px-4 py-2 shadow-lg flex items-center gap-3 animate-slideInRight"
              style={{
                animationDelay: `${i * 0.2}s`,
                transform: `translateX(${i * 10}px)`,
              }}
            >
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Bell className="w-4 h-4 text-orange-500" />
              </div>
              <div className="w-24 h-2 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default gradient hero
  return (
    <div
      className={cn(
        'relative w-full h-full overflow-hidden',
        'bg-gradient-to-br',
        CATEGORY_GRADIENTS[category],
        className
      )}
    >
      {/* Kente-inspired pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="kente"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <rect width="10" height="10" fill="white" />
              <rect x="10" y="10" width="10" height="10" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#kente)" />
        </svg>
      </div>

      {/* Category icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 text-white/30">
          {CATEGORY_ICONS[category]}
        </div>
      </div>

      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
    </div>
  );
};

export default ReleaseHero;
