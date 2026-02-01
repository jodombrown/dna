import React from 'react';
import { Link } from 'react-router-dom';

interface ManifestoLinkProps {
  to: string;
  children: React.ReactNode;
  variant?: 'five-c' | 'subtle';
}

export function ManifestoLink({ to, children, variant = 'subtle' }: ManifestoLinkProps) {
  if (variant === 'five-c') {
    return (
      <Link
        to={to}
        className="text-[#4A8D77] font-bold underline decoration-2 underline-offset-4 hover:decoration-[#2D5A4A] transition-colors"
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className="text-[#1A1A1A] underline decoration-1 underline-offset-2 decoration-[#B87333]/50 hover:decoration-[#B87333] transition-colors"
    >
      {children}
    </Link>
  );
}

export default ManifestoLink;
