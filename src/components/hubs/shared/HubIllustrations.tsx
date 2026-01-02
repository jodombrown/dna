// src/components/hubs/shared/HubIllustrations.tsx
// Abstract illustrations for each hub's Aspiration Mode

import React from 'react';

interface IllustrationProps {
  className?: string;
}

// Convene: Gathering of abstract figures with Kente pattern influence
export function ConveneIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle */}
      <circle cx="100" cy="100" r="95" fill="hsl(var(--dna-emerald))" fillOpacity="0.1" />

      {/* Kente-inspired pattern lines */}
      <g stroke="hsl(var(--dna-copper))" strokeWidth="2" strokeOpacity="0.3">
        <line x1="40" y1="40" x2="40" y2="160" />
        <line x1="60" y1="40" x2="60" y2="160" />
        <line x1="140" y1="40" x2="140" y2="160" />
        <line x1="160" y1="40" x2="160" y2="160" />
        <line x1="40" y1="60" x2="160" y2="60" />
        <line x1="40" y1="140" x2="160" y2="140" />
      </g>

      {/* Central gathering - abstract figures */}
      <g fill="hsl(var(--dna-emerald))">
        {/* Center figure */}
        <circle cx="100" cy="85" r="12" />
        <path d="M85 100 Q100 115 115 100 Q115 130 100 130 Q85 130 85 100" />

        {/* Left figure */}
        <circle cx="65" cy="90" r="10" />
        <path d="M52 102 Q65 115 78 102 Q78 125 65 125 Q52 125 52 102" />

        {/* Right figure */}
        <circle cx="135" cy="90" r="10" />
        <path d="M122 102 Q135 115 148 102 Q148 125 135 125 Q122 125 122 102" />
      </g>

      {/* Connection lines */}
      <g stroke="hsl(var(--dna-copper))" strokeWidth="2" strokeDasharray="4 4">
        <line x1="75" y1="95" x2="88" y2="90" />
        <line x1="125" y1="95" x2="112" y2="90" />
      </g>

      {/* Decorative dots */}
      <g fill="hsl(var(--dna-gold))">
        <circle cx="100" cy="55" r="4" />
        <circle cx="50" cy="100" r="3" />
        <circle cx="150" cy="100" r="3" />
        <circle cx="80" cy="145" r="3" />
        <circle cx="120" cy="145" r="3" />
      </g>
    </svg>
  );
}

// Collaborate: Hands joining puzzle pieces with Ndebele pattern influence
export function CollaborateIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background */}
      <circle cx="100" cy="100" r="95" fill="hsl(var(--dna-emerald))" fillOpacity="0.1" />

      {/* Ndebele-inspired geometric border */}
      <g stroke="hsl(var(--dna-copper))" strokeWidth="2" fill="none">
        <rect x="30" y="30" width="30" height="30" />
        <rect x="140" y="30" width="30" height="30" />
        <rect x="30" y="140" width="30" height="30" />
        <rect x="140" y="140" width="30" height="30" />
      </g>

      {/* Puzzle pieces */}
      <g fill="hsl(var(--dna-emerald))">
        {/* Left piece */}
        <path d="M60 80 L90 80 L90 95 Q100 95 100 105 Q100 95 110 95 L110 80 L110 70 L60 70 Z" />
        {/* Right piece */}
        <path d="M90 120 L90 105 Q100 105 100 95 Q100 105 110 105 L110 120 L140 120 L140 130 L90 130 Z" />
      </g>

      {/* Hands */}
      <g fill="hsl(var(--dna-copper))" fillOpacity="0.8">
        {/* Left hand */}
        <ellipse cx="55" cy="100" rx="15" ry="20" />
        <rect x="50" y="75" width="10" height="25" rx="5" />
        {/* Right hand */}
        <ellipse cx="145" cy="100" rx="15" ry="20" />
        <rect x="140" y="75" width="10" height="25" rx="5" />
      </g>

      {/* Connection spark */}
      <g fill="hsl(var(--dna-gold))">
        <circle cx="100" cy="100" r="6" />
        <path d="M96 88 L100 95 L104 88 Z" />
        <path d="M96 112 L100 105 L104 112 Z" />
        <path d="M88 96 L95 100 L88 104 Z" />
        <path d="M112 96 L105 100 L112 104 Z" />
      </g>
    </svg>
  );
}

// Contribute: Exchange/flow symbol with Mudcloth pattern influence
export function ContributeIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background */}
      <circle cx="100" cy="100" r="95" fill="hsl(var(--dna-emerald))" fillOpacity="0.1" />

      {/* Mudcloth-inspired pattern */}
      <g stroke="hsl(var(--dna-copper))" strokeWidth="1.5" strokeOpacity="0.3">
        <path d="M35 50 L45 40 L55 50 L45 60 Z" />
        <path d="M145 50 L155 40 L165 50 L155 60 Z" />
        <path d="M35 150 L45 140 L55 150 L45 160 Z" />
        <path d="M145 150 L155 140 L165 150 L155 160 Z" />
      </g>

      {/* Exchange arrows */}
      <g fill="hsl(var(--dna-emerald))">
        {/* Top arrow (giving) */}
        <path d="M70 70 L100 50 L130 70 L115 70 L115 90 L85 90 L85 70 Z" />
        {/* Bottom arrow (receiving) */}
        <path d="M130 130 L100 150 L70 130 L85 130 L85 110 L115 110 L115 130 Z" />
      </g>

      {/* Central exchange circle */}
      <circle cx="100" cy="100" r="15" fill="hsl(var(--dna-copper))" />
      <g stroke="white" strokeWidth="2">
        <path d="M92 100 L108 100 M100 92 L100 108" />
      </g>

      {/* Flow particles */}
      <g fill="hsl(var(--dna-gold))">
        <circle cx="75" cy="80" r="3" />
        <circle cx="125" cy="80" r="3" />
        <circle cx="75" cy="120" r="3" />
        <circle cx="125" cy="120" r="3" />
        <circle cx="100" cy="65" r="4" />
        <circle cx="100" cy="135" r="4" />
      </g>
    </svg>
  );
}

// Convey: Megaphone with waves and Adinkra symbol influence
export function ConveyIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background */}
      <circle cx="100" cy="100" r="95" fill="hsl(var(--dna-emerald))" fillOpacity="0.1" />

      {/* Adinkra-inspired symbols in corners */}
      <g fill="hsl(var(--dna-copper))" fillOpacity="0.3">
        {/* Sankofa-like symbol */}
        <path d="M40 40 Q50 35 55 45 Q50 50 45 45 Q40 50 40 40" />
        <path d="M160 40 Q150 35 145 45 Q150 50 155 45 Q160 50 160 40" />
      </g>

      {/* Megaphone */}
      <g fill="hsl(var(--dna-emerald))">
        {/* Cone */}
        <path d="M60 85 L120 65 L120 135 L60 115 Z" />
        {/* Handle */}
        <rect x="45" y="90" width="20" height="20" rx="3" />
        {/* Mouth */}
        <ellipse cx="120" cy="100" rx="8" ry="35" />
      </g>

      {/* Sound waves */}
      <g stroke="hsl(var(--dna-copper))" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M135 85 Q145 100 135 115" />
        <path d="M150 75 Q165 100 150 125" />
        <path d="M165 65 Q185 100 165 135" />
      </g>

      {/* Story dots/text lines */}
      <g fill="hsl(var(--dna-gold))">
        <circle cx="140" cy="100" r="4" />
        <rect x="148" y="98" width="20" height="4" rx="2" />
        <circle cx="155" cy="85" r="3" />
        <rect x="162" y="83" width="15" height="4" rx="2" />
        <circle cx="155" cy="115" r="3" />
        <rect x="162" y="113" width="15" height="4" rx="2" />
      </g>
    </svg>
  );
}

// Connect: Network of profiles
export function ConnectIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background */}
      <circle cx="100" cy="100" r="95" fill="hsl(var(--dna-emerald))" fillOpacity="0.1" />

      {/* Connection lines */}
      <g stroke="hsl(var(--dna-copper))" strokeWidth="2" strokeDasharray="4 4">
        <line x1="100" y1="70" x2="60" y2="110" />
        <line x1="100" y1="70" x2="140" y2="110" />
        <line x1="60" y1="110" x2="100" y2="150" />
        <line x1="140" y1="110" x2="100" y2="150" />
        <line x1="60" y1="110" x2="140" y2="110" />
      </g>

      {/* Profile circles */}
      <g>
        {/* Top center */}
        <circle cx="100" cy="60" r="18" fill="hsl(var(--dna-emerald))" />
        <circle cx="100" cy="55" r="6" fill="white" />
        <ellipse cx="100" cy="68" rx="8" ry="5" fill="white" />

        {/* Bottom left */}
        <circle cx="55" cy="115" r="18" fill="hsl(var(--dna-emerald))" />
        <circle cx="55" cy="110" r="6" fill="white" />
        <ellipse cx="55" cy="123" rx="8" ry="5" fill="white" />

        {/* Bottom right */}
        <circle cx="145" cy="115" r="18" fill="hsl(var(--dna-emerald))" />
        <circle cx="145" cy="110" r="6" fill="white" />
        <ellipse cx="145" cy="123" rx="8" ry="5" fill="white" />

        {/* Bottom center */}
        <circle cx="100" cy="155" r="18" fill="hsl(var(--dna-emerald))" />
        <circle cx="100" cy="150" r="6" fill="white" />
        <ellipse cx="100" cy="163" rx="8" ry="5" fill="white" />
      </g>

      {/* Decorative elements */}
      <g fill="hsl(var(--dna-gold))">
        <circle cx="80" cy="90" r="4" />
        <circle cx="120" cy="90" r="4" />
        <circle cx="80" cy="135" r="4" />
        <circle cx="120" cy="135" r="4" />
      </g>
    </svg>
  );
}

export default {
  ConveneIllustration,
  CollaborateIllustration,
  ContributeIllustration,
  ConveyIllustration,
  ConnectIllustration
};
