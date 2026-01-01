/**
 * ZeroStateWelcomeCard
 *
 * Welcome card for new users introducing DIA (Diaspora Intelligence Agent)
 * and providing quick action buttons to get started.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, PenSquare, X, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { TYPOGRAPHY } from '@/lib/typography.config';

interface ZeroStateWelcomeCardProps {
  onDismiss: () => void;
}

export function ZeroStateWelcomeCard({ onDismiss }: ZeroStateWelcomeCardProps) {
  const { profile } = useAuth();
  const firstName = profile?.first_name || profile?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="relative bg-gradient-to-br from-dna-emerald to-dna-forest rounded-xl p-6 text-white shadow-lg">
      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Dismiss welcome card"
      >
        <X className="w-5 h-5" />
      </button>

      {/* DIA Avatar and Welcome Message */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="flex-1 pr-8">
          <h2 className={`${TYPOGRAPHY.h4} text-white mb-1`}>
            Welcome to DNA, {firstName}!
          </h2>
          <p className="text-white/90 text-sm md:text-base leading-relaxed">
            I'm DIA, your Diaspora Intelligence Agent. I'll help you connect
            with the global African diaspora community.
          </p>
        </div>
      </div>

      <p className="text-white/80 mb-6 text-sm md:text-base">
        Here's what's happening right now — dive in!
      </p>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Link
          to="/dna/connect"
          className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
        >
          <Users className="w-4 h-4" />
          <span>Connect</span>
        </Link>
        <Link
          to="/dna/convene"
          className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
        >
          <Calendar className="w-4 h-4" />
          <span>Attend</span>
        </Link>
        <Link
          to="/dna/convey"
          className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
        >
          <PenSquare className="w-4 h-4" />
          <span>Share</span>
        </Link>
      </div>
    </div>
  );
}
