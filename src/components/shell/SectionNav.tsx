/**
 * SectionNav: route-driven navigation for panes inside ONE subject, never a
 * corpus switch. No track, no fill, no container — a hairline baseline the
 * full width, active marked by a 2px rule and a weight change. Labels always
 * visible. Cannot be mistaken for a Lens Bar because it has no box. See S16
 * (BD388 pack).
 */
import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SectionNavItem = {
  label: string;
  path: string; // relative, matches the nested route's own path segment
  icon: LucideIcon;
  roles: string[];
};

interface SectionNavProps {
  items: SectionNavItem[];
  userRole: string;
}

export function SectionNav({ items, userRole }: SectionNavProps) {
  const visible = items.filter((item) => userRole === 'owner' || item.roles.includes(userRole));
  return (
    <nav
      aria-label="Event sections"
      className="flex items-center gap-1 overflow-x-auto border-b border-border"
    >
      {visible.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === ''}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-1.5 px-3 py-2.5 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors',
              isActive
                ? 'border-foreground text-foreground font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )
          }
        >
          <item.icon className="h-4 w-4" aria-hidden="true" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
