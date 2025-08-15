import React from "react";
import { NavLink } from "react-router-dom";

interface SettingsNavProps {
  active?: 'profile' | 'experience' | 'links' | 'privacy' | 'dna-experience';
}

const tabs = [
  { key: 'profile', label: 'Profile', href: '/settings/profile' },
  { key: 'experience', label: 'Experience', href: '/settings/experience' },
  { key: 'dna-experience', label: 'DNA Experience', href: '/settings/dna-experience' },
  { key: 'links', label: 'Links', href: '/settings/links' },
  { key: 'privacy', label: 'Privacy', href: '/settings/privacy' },
] as const;

const SettingsNav: React.FC<SettingsNavProps> = ({ active }) => {
  return (
    <nav aria-label="Settings navigation" className="-mx-2 mb-2">
      <ul className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <li key={t.key}>
            <NavLink
              to={t.href}
              className={({ isActive }) => [
                'inline-flex items-center rounded-md border px-3 py-1.5 text-sm transition-colors',
                isActive || active === t.key
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-background text-muted-foreground border-border hover:bg-muted'
              ].join(' ')}
            >
              {t.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SettingsNav;
