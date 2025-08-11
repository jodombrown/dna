import React, { useEffect, useMemo, useRef, useState } from "react";

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Simple local typeahead. TODO: swap with Google Places/Mapbox/OpenCage provider
const suggestionsSeed = [
  "Nairobi, Kenya",
  "Accra, Ghana",
  "Lagos, Nigeria",
  "Kigali, Rwanda",
  "Johannesburg, South Africa",
  "Cairo, Egypt",
  "Addis Ababa, Ethiopia",
  "Abidjan, Côte d’Ivoire",
  "London, United Kingdom",
  "New York, USA",
  "Toronto, Canada",
  "Paris, France",
];

const LocationSearch: React.FC<LocationSearchProps> = ({ value, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const list = useMemo(() => {
    if (!value) return suggestionsSeed.slice(0, 6);
    const v = value.toLowerCase();
    return suggestionsSeed.filter((s) => s.toLowerCase().includes(v)).slice(0, 6);
  }, [value]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, Math.max(list.length - 1, 0)));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter" && list[active]) {
            e.preventDefault();
            onChange(list[active]);
            setOpen(false);
          }
        }}
        placeholder={placeholder || "Current city, country"}
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls="location-suggestions"
      />
      {open && list.length > 0 && (
        <ul
          id="location-suggestions"
          className="absolute z-20 mt-1 w-full rounded-md border border-border bg-popover shadow-lg max-h-56 overflow-auto"
          role="listbox"
        >
          {list.map((s, i) => (
            <li
              key={s}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(s); setOpen(false); }}
              className={`px-3 py-2 text-sm cursor-pointer ${i === active ? "bg-accent text-accent-foreground" : "hover:bg-muted"}`}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationSearch;
