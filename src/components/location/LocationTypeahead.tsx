import { useState } from 'react';
import { useLocationSearch } from '@/hooks/useLocationSearch';
import { LocalProvider } from '@/lib/location/provider';

export type LocationTypeaheadProps = {
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  provider?: 'local'; // future: 'mapbox' | 'google'
};

export default function LocationTypeahead({
  value = '',
  onChange,
  placeholder = 'Current location',
  provider = 'local',
}: LocationTypeaheadProps) {
  const [q, setQ] = useState(value);
  const [open, setOpen] = useState(false);

  const { results, loading } = useLocationSearch(LocalProvider, q, 250);

  const pick = (label: string) => {
    setQ(label);
    onChange(label);
    setOpen(false);
  };

  return (
    <div className="relative">
      <input
        className="w-full rounded border px-3 py-2"
        value={q}
        placeholder={placeholder}
        onChange={(e) => {
          setQ(e.target.value);
          onChange(e.target.value);
        }}
        onFocus={() => results.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {open && results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full rounded border bg-background shadow">
          {results.map((opt) => (
            <button
              key={opt.id}
              className="block w-full text-left px-3 py-2 hover:bg-muted"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(opt.label)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
      {loading && <div className="absolute right-2 top-2 text-xs">…</div>}
    </div>
  );
}
