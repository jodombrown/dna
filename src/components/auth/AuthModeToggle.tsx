import { cn } from '@/lib/utils';

export type AuthMode = 'signup' | 'signin';

interface AuthModeToggleProps {
  value: AuthMode;
  onChange: (mode: AuthMode) => void;
}

const TABS: Array<{ value: AuthMode; label: string }> = [
  { value: 'signup', label: 'Request access' },
  { value: 'signin', label: 'Sign in' },
];

/**
 * Segmented control for the two auth surfaces (open sign up, sign in).
 * Lives outside src/pages so its internal padding is component styling,
 * not page-level layout.
 */
export const AuthModeToggle = ({ value, onChange }: AuthModeToggleProps) => (
  <div
    role="tablist"
    aria-label="Account access"
    className="flex items-center p-1 bg-muted rounded-lg w-full mx-auto"
  >
    {TABS.map((tab) => (
      <button
        key={tab.value}
        type="button"
        role="tab"
        aria-selected={value === tab.value}
        onClick={() => onChange(tab.value)}
        className={cn(
          'flex-1 py-2 text-meta font-medium rounded-md transition-all',
          value === tab.value
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        {tab.label}
      </button>
    ))}
  </div>
);
