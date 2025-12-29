import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useFeaturedCount } from '@/hooks/useReleases';
import { cn } from '@/lib/utils';

interface NewFeaturePillProps {
  className?: string;
}

export const NewFeaturePill: React.FC<NewFeaturePillProps> = ({ className }) => {
  const navigate = useNavigate();
  const { data: count = 0, isLoading } = useFeaturedCount();

  // Don't show if no new features or loading
  if (isLoading || count === 0) return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate('/releases?filter=featured')}
      className={cn(
        'relative inline-flex items-center gap-2 px-4 py-2 rounded-full',
        'bg-gradient-to-r from-dna-emerald to-dna-forest',
        'text-white text-sm font-semibold',
        'shadow-lg hover:shadow-xl transition-shadow cursor-pointer',
        'group overflow-hidden',
        className
      )}
    >
      {/* Animated pulse background */}
      <motion.div
        className="absolute inset-0 bg-white/20 rounded-full"
        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <Sparkles className="w-4 h-4 relative z-10" />
      
      <span className="relative z-10">What's New</span>
      
      {/* Count badge */}
      <span className="relative z-10 bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
        {count}
      </span>
      
      <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
    </motion.button>
  );
};
