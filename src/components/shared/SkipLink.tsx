import React from 'react';

/**
 * SkipLink — Accessible skip navigation link.
 *
 * Visually hidden until focused via keyboard (Tab).
 * Jumps focus to the element matching `targetId`.
 *
 * WCAG 2.1 SC 2.4.1: Bypass Blocks (Level A)
 */
interface SkipLinkProps {
  /** The id of the target element (without #). Defaults to "main-content". */
  targetId?: string;
  /** Visible label. Defaults to "Skip to main content". */
  label?: string;
}

const SkipLink: React.FC<SkipLinkProps> = ({
  targetId = 'main-content',
  label = 'Skip to main content',
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus({ preventScroll: false });
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-md focus:bg-primary focus:text-primary-foreground focus:text-sm focus:font-medium focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      {label}
    </a>
  );
};

export default SkipLink;
